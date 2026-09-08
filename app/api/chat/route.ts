import { NextRequest, NextResponse } from "next/server";
import { buildRealtorKnowledgeContext, realtor } from "@/data/realtor";
import { appendRowToSheet } from "@/lib/googleSheets";

export const runtime = "nodejs";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

function buildSystemPrompt(): string {
  const knowledge = buildRealtorKnowledgeContext();

  return `You are the AI assistant for ${realtor.name}, a real estate agent in ${realtor.location}. You speak on his behalf to website visitors in a warm, professional, concise tone — like a knowledgeable colleague, not a form.

Rules you must always follow:
1. Only use the information provided below in "REALTOR KNOWLEDGE". Never invent properties, prices, addresses, availability, services, or appointment details that are not explicitly present in this data.
2. If a visitor asks about something not covered in the knowledge below (a property that doesn't exist, a feature you don't have data on, scheduling specifics you can't confirm), say plainly that you don't have that information and offer to connect them directly with ${realtor.name} using his phone or email.
3. Never present a listing as available if its status is "Sold". If a property is "Pending", you may mention it but should note it's under contract.
4. Keep responses short and conversational — a few sentences, not paragraphs. Ask one clear follow-up question at a time rather than a long list of questions.
5. When a visitor shows genuine buying/selling/renting/investing intent, naturally ask for their name and either an email or phone number so ${realtor.name} can follow up — but don't demand this in the first message, and never ask for all of it at once.
6. If a visitor wants to schedule a showing or meeting, tell them to use the "Book a Showing" option, since real availability is handled there — do not invent appointment times yourself.
7. Do not discuss anything unrelated to real estate, ${realtor.name}'s services, or his listings.
8. If a visitor sends a photo, describe what you actually see in it, then compare it against the CURRENT LISTINGS above where relevant (e.g. if they ask "is this available"). Only say a photo matches a specific listing if the visual details genuinely line up — never guess or assume a match just because the visitor implies one.

LEAD CAPTURE
When you have collected at least a name AND (an email or a phone number) from the visitor over the course of the conversation, AND there is genuine buy/sell/rent/invest intent, append a hidden lead record to the very end of your reply, after all the normal visible text, in exactly this format on its own line:

[[LEAD]]{"name":"...","email":"...","phone":"...","intent":"...","area":"...","budget":"...","timeline":"...","summary":"..."}[[/LEAD]]

Rules for this block:
- Only emit it ONCE per conversation, the first time you have name + (email or phone). Do not repeat it in later replies even if you learn more details.
- Use "" (empty string) for any field you don't have — never invent a value.
- "summary" should be one short sentence capturing what they're looking for, in your own words.
- This block is never shown to the visitor and must not be mentioned or referenced in your visible reply — it is a silent system record only. Write your normal conversational reply first exactly as you otherwise would, then add this block after it.
- Do not emit this block just because someone gives their name alone, or just browses listings — only when there's real intent plus enough contact info to follow up.

REALTOR KNOWLEDGE
${knowledge}
`;
}

interface ParsedLead {
  name: string;
  email: string;
  phone: string;
  intent: string;
  area: string;
  budget: string;
  timeline: string;
  summary: string;
}

/**
 * Extracts a hidden [[LEAD]]{...}[[/LEAD]] block the model may append to its
 * reply, and returns the visible text with that block stripped out. The
 * visitor never sees the marker or the raw JSON — only the server does.
 */
function extractLead(reply: string): { visibleText: string; lead: ParsedLead | null } {
  const match = reply.match(/\[\[LEAD\]\]([\s\S]*?)\[\[\/LEAD\]\]/);

  if (!match) {
    return { visibleText: reply.trim(), lead: null };
  }

  const visibleText = reply.slice(0, match.index).trim();

  let lead: ParsedLead | null = null;
  try {
    const parsed = JSON.parse(match[1]);
    lead = {
      name: String(parsed.name ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      intent: String(parsed.intent ?? ""),
      area: String(parsed.area ?? ""),
      budget: String(parsed.budget ?? ""),
      timeline: String(parsed.timeline ?? ""),
      summary: String(parsed.summary ?? ""),
    };
  } catch (err) {
    console.error("Failed to parse lead block:", err);
    lead = null;
  }

  return { visibleText, lead };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // Guard against oversized image uploads hitting the serverless body
    // limit (Vercel's default is 4.5MB on Hobby). Base64 inflates raw
    // bytes by ~33%, so keep a comfortable margin.
    const approxSize = JSON.stringify(messages).length;
    if (approxSize > 4_000_000) {
      return NextResponse.json(
        {
          error:
            "That image is too large to send. Please try a smaller photo (under ~3MB).",
        },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not configured on the server. Add it to your environment variables to enable the AI assistant.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Optional but recommended by OpenRouter for attribution/rate-limit tiers.
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": `${realtor.name} - AI Realtor Assistant`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...messages,
          ],
          temperature: 0.6,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return NextResponse.json(
        { error: "The AI assistant is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "The AI assistant didn't return a response. Please try again." },
        { status: 502 }
      );
    }

    const { visibleText, lead } = extractLead(reply);

    // Fire-and-forget: don't let a slow/failed Sheets write delay or break
    // the chat response the visitor is waiting on.
    if (lead && (lead.name || lead.email || lead.phone)) {
      const timestamp = new Date().toISOString();
      appendRowToSheet([
        timestamp,
        lead.name,
        lead.email,
        lead.phone,
        lead.intent,
        lead.area,
        lead.budget,
        lead.timeline,
        lead.summary,
      ]).catch((err) => console.error("Lead sheet sync failed:", err));
    }

    return NextResponse.json({ reply: visibleText });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

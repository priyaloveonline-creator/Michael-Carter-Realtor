import { NextRequest, NextResponse } from "next/server";
import { buildRealtorKnowledgeContext, realtor } from "@/data/realtor";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

REALTOR KNOWLEDGE
${knowledge}
`;
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
          "X-Title": `${realtor.name} — AI Realtor Assistant`,
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

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

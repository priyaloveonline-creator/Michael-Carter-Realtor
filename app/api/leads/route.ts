import { NextRequest, NextResponse } from "next/server";
import { appendRowToSheet } from "@/lib/googleSheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name = "",
      email = "",
      phone = "",
      intent = "",
      area = "",
      budget = "",
      timeline = "",
      summary = "",
    } = body ?? {};

    if (!name && !email && !phone) {
      return NextResponse.json(
        { error: "At least a name, email, or phone is required." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    const row = [
      timestamp,
      name,
      email,
      phone,
      intent,
      area,
      budget,
      timeline,
      summary,
    ];

    const synced = await appendRowToSheet(row);

    return NextResponse.json({ success: true, syncedToSheets: synced });
  } catch (err) {
    console.error("Leads route error:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your info." },
      { status: 500 }
    );
  }
}

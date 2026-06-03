import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are the AI assistant for Big Money Realty, a premium Las Vegas real estate brokerage owned by Damian Einbinder — broker-owner with nearly a decade of experience in the Las Vegas market.

ABOUT DAMIAN:
- Broker-owner of Big Money Realty in Las Vegas, NV
- Nearly 10 years in Las Vegas real estate
- Specializes in buying, selling, and investing across the Las Vegas valley
- Known for results-driven approach, 24/7 availability, and strong negotiation
- Has appeared in TV commercials
- Works with first-time buyers, move-up buyers, investors, and sellers

SERVICES:
- Buyer representation (all price points, first-time buyers, investors, relocation)
- Seller representation (listing, marketing, negotiation, sold fast and for top dollar)
- Free home valuation (instant estimate + Damian's expert analysis)
- Investment property consulting
- Luxury real estate

LAS VEGAS MARKET:
- Fast-moving market — well-priced homes move quickly
- Strong rental market — great for investors
- No state income tax — major draw for relocators
- Popular areas: Summerlin, Henderson, North Las Vegas, Downtown, The Lakes, Green Valley, Aliante

YOUR JOB:
- Answer questions about buying, selling, and investing in Las Vegas
- Qualify leads by asking about their timeline, budget, and situation
- Capture contact info by directing motivated buyers/sellers to fill out the form or call Damian
- Never make up specific listing data — direct them to browse listings or contact Damian for current inventory
- Keep responses concise (2-4 sentences), warm, and confident
- When someone is ready to move forward, say: "I'll connect you with Damian directly — drop your number in the form below and he'll call you within the hour."`;

interface HistoryMessage { role: "user" | "assistant"; content: string; }

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI assistant is temporarily unavailable." }, { status: 503 });

  let body: { message?: string; history?: HistoryMessage[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const message = body?.message?.trim();
  if (!message) return NextResponse.json({ error: "No message provided." }, { status: 400 });

  const history: HistoryMessage[] = Array.isArray(body.history)
    ? body.history.slice(-10).filter((m) => m.role && m.content)
    : [];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 350,
        system: SYSTEM,
        messages: [...history, { role: "user", content: message }],
      }),
    });

    if (!res.ok) return NextResponse.json({ error: "AI service unavailable." }, { status: 502 });

    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? "";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

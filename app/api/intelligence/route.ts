/**
 * POST /api/intelligence — the industry intelligence assistant. Produces an
 * executive one-page report on what's trending and what competitors are doing
 * in the salon's niche, informed by its services and location. Uses Claude +
 * web search; graceful without ANTHROPIC_API_KEY.
 */
import { NextRequest, NextResponse } from "next/server";
import { runClaudeWithSearch } from "@/lib/claude";

const SYSTEM = `You are the industry intelligence assistant for a salon/spa/medspa owner. Produce a crisp, executive ONE-PAGE monthly briefing on trends and competitor activity in their specific niche.

Use web search for current, real signals (recent trends, popular services, pricing moves, what nearby or comparable businesses are promoting). Be specific and recent — cite what you found in plain language, no fabricated stats.

Format exactly with these markdown sections, nothing else:
# <punchy 4-6 word headline>
**This month at a glance** — 2 sentences.
## Trending now
- 3-4 bullets: specific services, ingredients, or formats gaining traction in their niche.
## What competitors are doing
- 3-4 bullets: pricing, promotions, packaging, or positioning moves worth noting.
## 3 moves for you
1. ...
2. ...
3. ...
Each move concrete and doable this month. Keep the whole thing under ~350 words.`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const salonType = (body.salonType ?? "salon").trim();
  const services = (body.services ?? "").trim();
  const location = (body.location ?? "").trim();
  const competitors = (body.competitors ?? "").trim();

  if (!services) {
    return NextResponse.json({ error: "List a few of your core services so I can focus the report." }, { status: 400 });
  }

  const prompt =
    `Business type: ${salonType}.\n` +
    `Core services: ${services}.\n` +
    (location ? `Location/market: ${location}.\n` : "") +
    (competitors ? `Known competitors: ${competitors}.\n` : "") +
    `Write this month's intelligence briefing for this business.`;

  const result = await runClaudeWithSearch(SYSTEM, prompt);
  if (!result.ok) {
    const msg = result.error.includes("ANTHROPIC_API_KEY")
      ? "The intelligence assistant needs an Anthropic API key (ANTHROPIC_API_KEY)."
      : `Couldn't generate the report (${result.error}).`;
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  return NextResponse.json({ ok: true, report: result.text });
}

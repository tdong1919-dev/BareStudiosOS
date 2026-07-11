/**
 * POST /api/intelligence — the industry intelligence assistant. Produces an
 * executive one-page report on what's trending and what competitors are doing
 * in the salon's niche, informed by its services and location. Uses Claude +
 * web search; graceful without ANTHROPIC_API_KEY.
 */
import { NextRequest, NextResponse } from "next/server";
import { runClaudeWithSearch } from "@/lib/claude";
import { INDUSTRY_INTELLIGENCE_SYSTEM_PROMPT } from "@/lib/agent-prompts";

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

  const result = await runClaudeWithSearch(INDUSTRY_INTELLIGENCE_SYSTEM_PROMPT, prompt);
  if (!result.ok) {
    const msg = result.error.includes("ANTHROPIC_API_KEY")
      ? "The intelligence assistant needs an Anthropic API key (ANTHROPIC_API_KEY)."
      : `Couldn't generate the report (${result.error}).`;
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  return NextResponse.json({ ok: true, report: result.text });
}

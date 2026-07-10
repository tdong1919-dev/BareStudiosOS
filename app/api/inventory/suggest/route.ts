/**
 * POST /api/inventory/suggest — the inventory assistant searches reputable online
 * suppliers for a product and suggests the cheapest place to reorder. Uses
 * Claude with web search; returns a graceful message if no key is configured.
 */
import { NextRequest, NextResponse } from "next/server";
import { runClaudeWithSearch } from "@/lib/claude";

const SYSTEM = `You are the inventory assistant for a salon supply manager. Given a product, search the web for reputable suppliers (manufacturer-authorized distributors, established beauty/salon supply retailers — not sketchy marketplaces) and recommend where to reorder for the best price.

Return a short, scannable answer:
- 2-4 supplier options as "Supplier — approx price/size — why it's reputable", cheapest first.
- One line on bulk/auto-ship savings if relevant.
- Flag if a product looks discontinued or counterfeit-prone.
Keep it under 180 words. Prices are estimates; tell them to confirm at checkout.`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const product = (body.product ?? "").trim();
  const vendor = (body.vendor ?? "").trim();
  if (!product) {
    return NextResponse.json({ error: "Tell me which product to source." }, { status: 400 });
  }

  const prompt =
    `Find the cheapest reputable place to reorder: ${product}.` +
    (vendor ? ` Current vendor is ${vendor} — beat or match it if you can.` : "");

  const result = await runClaudeWithSearch(SYSTEM, prompt);
  if (!result.ok) {
    const msg = result.error.includes("ANTHROPIC_API_KEY")
      ? "Reorder suggestions need an Anthropic API key (ANTHROPIC_API_KEY). The flag was still recorded."
      : `Couldn't fetch suggestions (${result.error}).`;
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  return NextResponse.json({ ok: true, suggestion: result.text });
}

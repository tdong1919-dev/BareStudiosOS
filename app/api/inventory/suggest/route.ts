/**
 * POST /api/inventory/suggest — the inventory assistant searches reputable online
 * suppliers for a product and suggests the cheapest place to reorder. Uses
 * Claude with web search; returns a graceful message if no key is configured.
 */
import { NextRequest, NextResponse } from "next/server";
import { runClaudeWithSearch } from "@/lib/claude";
import { INVENTORY_ASSISTANT_SYSTEM_PROMPT } from "@/lib/agent-prompts";

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

  const result = await runClaudeWithSearch(INVENTORY_ASSISTANT_SYSTEM_PROMPT, prompt);
  if (!result.ok) {
    const msg = result.error.includes("ANTHROPIC_API_KEY")
      ? "Reorder suggestions need an Anthropic API key (ANTHROPIC_API_KEY). The flag was still recorded."
      : `Couldn't fetch suggestions (${result.error}).`;
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  return NextResponse.json({ ok: true, suggestion: result.text });
}

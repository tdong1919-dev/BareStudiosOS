/**
 * Shared Claude helper for the read-only "report" assistants (inventory reorder
 * suggestions, industry intelligence). Runs a single prompt with the web_search
 * server tool and adaptive thinking, handling the pause_turn continuation loop.
 * Returns a graceful error if ANTHROPIC_API_KEY isn't set.
 */
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export async function runClaudeWithSearch(
  system: string,
  prompt: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY is not set." };
  }
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  try {
    for (let i = 0; i < 5; i++) {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system,
        tools: [{ type: "web_search_20260209", name: "web_search" }],
        messages,
      });
      if (resp.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }
      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { ok: true, text };
    }
    return { ok: false, error: "The model needed too many search rounds — try a narrower request." };
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `${err.status}: ${err.message}` : "claude error";
    return { ok: false, error: message };
  }
}

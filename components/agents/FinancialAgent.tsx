"use client";
/**
 * FinancialAgent — chat UI for the Claude-powered financial assistant. Sends the
 * running conversation to /api/financial-agent and renders the reply. The
 * server hides the tool-use loop (payroll math + sheet writes); the client only
 * stores plain {role, content} turns.
 */
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Set Alex to 45% commission, no hourly.",
  "Run payroll for Alex: $4,200 in services, $380 tips, 60 hours.",
  "How can I improve my margin this month?",
];

export default function FinancialAgent() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your financial assistant. I can set commission rates, run payroll, and suggest ways to lift your bottom line. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/financial-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="max-h-[460px] min-h-[320px] overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-white"
                  : "bg-surface-elevated text-text-primary"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-surface-elevated px-4 py-2.5 text-sm text-text-muted">Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border px-3 py-1.5 text-[12px] text-text-secondary hover:bg-black/[0.03]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="px-5 pb-2 text-xs text-error">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about commissions, payroll, or margin…"
          aria-label="Message the financial assistant"
          className="flex-1 rounded-md border border-border bg-white px-4 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-gradient-brand px-5 py-2.5 text-[12px] uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

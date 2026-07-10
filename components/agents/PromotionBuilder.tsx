"use client";
/**
 * PromotionBuilder — build and schedule a rewards/promotion campaign with
 * starter templates (birthday, Mother's Day, holidays, win-back). POSTs to
 * /api/promotion. Audience targeting + channels + a future send date.
 */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

const AUDIENCES = ["All clients", "Lapsed clients (60+ days)", "VIP / top spenders", "New clients", "Birthday this month"];
const CHANNELS = ["Email", "SMS", "In-app"];

type Template = { label: string; name: string; type: string; offer: string; audience: string };
const TEMPLATES: Template[] = [
  { label: "Birthday", name: "Birthday treat", type: "Birthday", offer: "20% off any service during your birthday month", audience: "Birthday this month" },
  { label: "Mother's Day", name: "Mother's Day", type: "Holiday", offer: "Mother's Day gift cards + complimentary add-on", audience: "All clients" },
  { label: "Holiday", name: "Holiday glow", type: "Holiday", offer: "Book before the holidays and get a free travel-size retail item", audience: "All clients" },
  { label: "Win-back", name: "We miss you", type: "Win-back", offer: "$25 off your next visit — it's been a while!", audience: "Lapsed clients (60+ days)" },
];

export default function PromotionBuilder() {
  const [form, setForm] = useState({
    name: "",
    type: "Promotion",
    offer: "",
    audience: AUDIENCES[0],
    channels: ["Email"] as string[],
    sendDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function applyTemplate(t: Template) {
    setForm((f) => ({ ...f, name: t.name, type: t.type, offer: t.offer, audience: t.audience }));
    setDone(null);
  }

  function toggleChannel(c: string) {
    setForm((f) => ({ ...f, channels: f.channels.includes(c) ? f.channels.filter((x) => x !== c) : [...f.channels, c] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.offer.trim()) {
      setError("Add a name and an offer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/promotion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setDone(json.status);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button key={t.label} type="button" onClick={() => applyTemplate(t)} className="rounded-full border border-border px-3 py-1.5 text-[12px] text-text-secondary hover:bg-black/[0.03]">
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Promotion name *" value={form.name} onChange={set("name")} aria-label="Name" />
          <input className={inputClass} placeholder="Type (e.g. Holiday)" value={form.type} onChange={set("type")} aria-label="Type" />
        </div>
        <textarea className={`${inputClass} min-h-[70px] resize-y`} placeholder="The offer * — e.g. 20% off color services" value={form.offer} onChange={set("offer")} aria-label="Offer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Who gets it</label>
            <select className={inputClass} value={form.audience} onChange={set("audience")} aria-label="Audience">
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Send date (optional)</label>
            <input className={inputClass} type="date" value={form.sendDate} onChange={set("sendDate")} aria-label="Send date" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Channels</label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => {
              const on = form.channels.includes(c);
              return (
                <button key={c} type="button" onClick={() => toggleChannel(c)} className="rounded-full px-3 py-1.5 text-[12px]" style={on ? { background: "var(--color-primary)", color: "#fff" } : { border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="Internal notes (optional)" value={form.notes} onChange={set("notes")} aria-label="Notes" />
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
          {submitting ? "Saving…" : "Save promotion"}
        </button>
        {done && <p className="text-xs text-success">Saved as {done}. It&apos;s in your Promotions tab{done === "scheduled" ? " and will fire on the send date once the scheduler is connected." : "."}</p>}
      </form>
    </div>
  );
}

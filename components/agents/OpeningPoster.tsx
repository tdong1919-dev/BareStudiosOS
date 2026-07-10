"use client";
/** OpeningPoster — owner posts a last-minute opening; alerts the waitlist. */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function OpeningPoster() {
  const [form, setForm] = useState({ service: "", when: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.service.trim() || !form.when.trim()) {
      setError("Add the service and the time.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/openings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setResult(`Alerted ${json.notified} of ${json.waitlist} on the waitlist.`);
      setForm({ service: "", when: "", note: "" });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Service (e.g. balayage)" value={form.service} onChange={set("service")} aria-label="Service" />
        <input className={inputClass} placeholder="When (e.g. today 3:30 PM)" value={form.when} onChange={set("when")} aria-label="When" />
      </div>
      <input className={inputClass} placeholder="Note (optional)" value={form.note} onChange={set("note")} aria-label="Note" />
      {error && <p className="text-sm text-error">{error}</p>}
      {result && <p className="text-sm text-success">{result}</p>}
      <button type="submit" disabled={submitting} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Alerting…" : "Post opening & alert waitlist"}
      </button>
    </form>
  );
}

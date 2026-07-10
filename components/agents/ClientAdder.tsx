"use client";
/** ClientAdder — add a client (name, last visit, rebook interval) → /api/client. */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function ClientAdder() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", lastVisit: "", service: "", intervalDays: "42" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Add the client's name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setForm({ name: "", email: "", phone: "", lastVisit: "", service: "", intervalDays: "42" });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Client name *" value={form.name} onChange={set("name")} aria-label="Name" />
        <input className={inputClass} placeholder="Service (e.g. balayage)" value={form.service} onChange={set("service")} aria-label="Service" />
        <input className={inputClass} placeholder="Email" value={form.email} onChange={set("email")} aria-label="Email" />
        <input className={inputClass} placeholder="Phone" value={form.phone} onChange={set("phone")} aria-label="Phone" />
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Last visit</label>
          <input className={inputClass} type="date" value={form.lastVisit} onChange={set("lastVisit")} aria-label="Last visit" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Rebook every (days)</label>
          <input className={inputClass} type="number" value={form.intervalDays} onChange={set("intervalDays")} aria-label="Interval days" />
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Saving…" : done ? "Added ✓ — add another" : "Add client"}
      </button>
      <p className="text-xs text-text-muted">Refresh after adding to see them in the rebook list.</p>
    </form>
  );
}

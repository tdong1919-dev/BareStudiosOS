"use client";
/** WaitlistForm — a client opts in to last-minute opening alerts. POST /api/waitlist. */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function WaitlistForm({ salon }: { salon: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", sms: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!salon) {
      setError("Add ?salon=Your%20Salon to the link to join a salon's list.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError("Add an email or phone.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ salon, ...form }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="rounded-xl border border-border bg-surface-elevated px-5 py-6 text-center text-sm text-text-secondary">You&apos;re on the list — we&apos;ll let you know the moment a spot opens up.</p>;
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <input className={inputClass} placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} aria-label="Name" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} aria-label="Email" />
        <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} aria-label="Phone" />
      </div>
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" checked={form.sms} onChange={(e) => setForm((f) => ({ ...f, sms: e.target.checked }))} />
        Also text me (SMS)
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Joining…" : "Notify me of openings"}
      </button>
      <p className="text-xs text-text-muted text-center">Opt out anytime.</p>
    </form>
  );
}

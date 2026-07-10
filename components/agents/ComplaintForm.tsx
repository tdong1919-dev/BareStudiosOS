"use client";
/**
 * ComplaintForm — a salon client files a complaint in-app. POSTs to
 * /api/complaint, which alerts the owner/manager and logs a ticket.
 */
import { useState } from "react";

const SEVERITIES = ["Minor", "Needs attention", "Urgent"];
const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function ComplaintForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", salonName: "", severity: SEVERITIES[1], message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim()) {
      setError("Please describe what happened.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(json.ticket);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success text-2xl">✓</div>
        <h3 className="font-serif text-xl font-medium">Thank you — we hear you.</h3>
        <p className="mt-2 text-sm text-text-secondary">
          A manager has been alerted (ticket <span className="font-medium">{done}</span>) and will follow up directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Your name" value={form.name} onChange={set("name")} aria-label="Your name" />
        <input className={inputClass} type="email" placeholder="Email" value={form.email} onChange={set("email")} aria-label="Email" />
        <input className={inputClass} placeholder="Phone" value={form.phone} onChange={set("phone")} aria-label="Phone" />
        <input className={inputClass} placeholder="Which salon / location" value={form.salonName} onChange={set("salonName")} aria-label="Salon or location" />
      </div>
      <select className={inputClass} value={form.severity} onChange={set("severity")} aria-label="How urgent">
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        className={`${inputClass} min-h-[120px] resize-y`}
        placeholder="Tell us what happened *"
        value={form.message}
        onChange={set("message")}
        aria-label="What happened"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send to a manager"}
      </button>
      <p className="text-xs text-text-muted text-center">Goes straight to the owner/manager — no need to call.</p>
    </form>
  );
}

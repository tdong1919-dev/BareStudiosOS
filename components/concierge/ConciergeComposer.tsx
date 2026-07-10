"use client";
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function ConciergeComposer() {
  const [form, setForm] = useState({ clientName: "", contact: "", message: "", channel: "Website chat" });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/concierge/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(json.error || "Could not save this message.");
        return;
      }
      setStatus("Saved to the AI concierge inbox.");
      setForm({ clientName: "", contact: "", message: "", channel: "Website chat" });
    } catch {
      setStatus("Network error - please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <p className="font-serif text-2xl font-medium">Log a concierge message</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} placeholder="Client name" aria-label="Client name" />
        <input className={inputClass} value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="Phone or email" aria-label="Contact" />
      </div>
      <select className={inputClass} value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} aria-label="Channel">
        <option>Website chat</option>
        <option>Phone call</option>
        <option>SMS</option>
        <option>Instagram DM</option>
      </select>
      <textarea className={`${inputClass} min-h-28`} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="What did the client ask for?" aria-label="Message" />
      {status && <p className="text-sm text-text-secondary">{status}</p>}
      <button type="submit" disabled={busy} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {busy ? "Saving..." : "Send to inbox"}
      </button>
    </form>
  );
}

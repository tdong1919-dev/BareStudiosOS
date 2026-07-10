"use client";
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function SuiteApplicationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    profession: "",
    desiredStart: "",
    instagram: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/suite-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Couldn't save this application.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <h2 className="font-serif text-3xl">Application received.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
          Bare Studios has your suite inquiry in the operating system. The owner or assigned manager can review it from the database queue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" aria-label="Name" />
        <input className={inputClass} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" aria-label="Email" />
        <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone" aria-label="Phone" />
        <input className={inputClass} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Business name" aria-label="Business name" />
        <input className={inputClass} value={form.profession} onChange={(e) => update("profession", e.target.value)} placeholder="Profession / service specialty" aria-label="Profession" />
        <input className={inputClass} type="date" value={form.desiredStart} onChange={(e) => update("desiredStart", e.target.value)} aria-label="Desired start date" />
      </div>
      <input className={`${inputClass} mt-3`} value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="Instagram or portfolio link" aria-label="Instagram" />
      <textarea className={`${inputClass} mt-3 min-h-28`} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Tell us what kind of suite or schedule you need." aria-label="Notes" />
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="mt-4 w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Saving..." : "Apply for a studio suite"}
      </button>
    </form>
  );
}

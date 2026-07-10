"use client";
/** ReviewForm — leave a review; POSTs to /api/review (saved to the Reviews tab). */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!review.trim()) {
      setError("Add a few words.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, source: "Website", review }),
      });
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
    return <p className="rounded-xl border border-border bg-surface-elevated px-5 py-6 text-center text-sm text-text-secondary">Thank you for the kind words — it means the world to us.</p>;
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <div className="flex items-center gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="text-2xl leading-none" style={{ color: n <= rating ? "#9A7B4F" : "var(--color-border)" }}>
            ★
          </button>
        ))}
      </div>
      <input className={inputClass} placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
      <textarea className={`${inputClass} min-h-[90px] resize-y`} placeholder="How was your visit? *" value={review} onChange={(e) => setReview(e.target.value)} aria-label="Your review" />
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Sending…" : "Leave a review"}
      </button>
    </form>
  );
}

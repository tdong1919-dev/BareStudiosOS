"use client";
/**
 * InventoryForm — a team member flags a low product (POST /api/inventory),
 * then can ask the inventory assistant for the cheapest reputable reorder source
 * (POST /api/inventory/suggest).
 */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function InventoryForm() {
  const [form, setForm] = useState({ product: "", onHand: "", threshold: "", vendor: "", flaggedBy: "", category: "Supplies", notes: "" });
  const [flagging, setFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function flag(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product.trim()) {
      setError("Enter the product name.");
      return;
    }
    setFlagging(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setFlagged(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setFlagging(false);
    }
  }

  async function suggest() {
    if (!form.product.trim()) {
      setError("Enter the product name first.");
      return;
    }
    setSuggesting(true);
    setSuggestion(null);
    setSuggestNote(null);
    try {
      const res = await fetch("/api/inventory/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: form.product, vendor: form.vendor }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSuggestNote(json.error || "Couldn't fetch suggestions.");
        return;
      }
      setSuggestion(json.suggestion);
    } catch {
      setSuggestNote("Network error — please try again.");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={flag} className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Product *" value={form.product} onChange={set("product")} aria-label="Product" />
          <input className={inputClass} placeholder="Usual vendor" value={form.vendor} onChange={set("vendor")} aria-label="Vendor" />
          <input className={inputClass} placeholder="On hand (qty)" value={form.onHand} onChange={set("onHand")} aria-label="On hand" />
          <input className={inputClass} placeholder="Reorder threshold" value={form.threshold} onChange={set("threshold")} aria-label="Threshold" />
          <input className={inputClass} placeholder="Your name" value={form.flaggedBy} onChange={set("flaggedBy")} aria-label="Flagged by" />
          <select className={inputClass} value={form.category} onChange={set("category")} aria-label="Tax category">
            <option value="Supplies">Supplies</option>
            <option value="Cost of Goods Sold">Cost of Goods Sold</option>
          </select>
        </div>
        <textarea className={`${inputClass} min-h-[70px] resize-y`} placeholder="Notes (optional)" value={form.notes} onChange={set("notes")} aria-label="Notes" />
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={flagging} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
            {flagging ? "Flagging…" : flagged ? "Flagged ✓ — flag another" : "Flag as low"}
          </button>
          <button type="button" onClick={suggest} disabled={suggesting} className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary hover:bg-black/[0.04] disabled:opacity-50">
            {suggesting ? "Searching…" : "Find cheapest reorder"}
          </button>
        </div>
        {flagged && <p className="text-xs text-success">Logged and the buyer was notified. It will categorize under {form.category} for taxes.</p>}
      </form>

      {suggestNote && <p className="text-xs text-text-muted">{suggestNote}</p>}
      {suggestion && (
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-text-muted">Reorder suggestions</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{suggestion}</p>
        </div>
      )}
    </div>
  );
}

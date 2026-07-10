"use client";
/**
 * IntelligenceReport — request a monthly industry briefing and render it as an
 * executive one-pager. POSTs to /api/intelligence. Includes a tiny markdown
 * renderer for the headings/bullets/bold the assistant returns.
 */
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

function bold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-medium">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

function Report({ md }: { md: string }) {
  const lines = md.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-1" />;
        if (t.startsWith("## ")) return <h3 key={i} className="mt-5 font-serif text-xl font-medium">{t.slice(3)}</h3>;
        if (t.startsWith("# ")) return <h2 key={i} className="font-serif text-2xl font-medium">{t.slice(2)}</h2>;
        if (t.startsWith("- ")) return <p key={i} className="flex gap-2 text-sm leading-relaxed text-text-secondary"><span className="text-[#9A7B4F]">—</span><span>{bold(t.slice(2))}</span></p>;
        const num = t.match(/^(\d+)\.\s+(.*)$/);
        if (num) return <p key={i} className="flex gap-2 text-sm leading-relaxed text-text-secondary"><span className="font-medium text-text-primary">{num[1]}.</span><span>{bold(num[2])}</span></p>;
        return <p key={i} className="text-sm leading-relaxed text-text-secondary">{bold(t)}</p>;
      })}
    </div>
  );
}

export default function IntelligenceReport() {
  const [form, setForm] = useState({ salonType: "Hair salon", services: "", location: "", competitors: "" });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!form.services.trim()) {
      setError("List a few core services.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/intelligence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      setReport(json.report);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Business type (e.g. medspa)" value={form.salonType} onChange={set("salonType")} aria-label="Business type" />
          <input className={inputClass} placeholder="City / market (optional)" value={form.location} onChange={set("location")} aria-label="Location" />
        </div>
        <input className={inputClass} placeholder="Core services * — e.g. balayage, lash extensions, facials" value={form.services} onChange={set("services")} aria-label="Services" />
        <input className={inputClass} placeholder="Known competitors (optional)" value={form.competitors} onChange={set("competitors")} aria-label="Competitors" />
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={loading} className="rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
          {loading ? "Researching the market…" : "Generate this month's briefing"}
        </button>
      </form>

      {report && (
        <div className="rounded-xl border border-border bg-surface-elevated p-6 sm:p-8">
          <Report md={report} />
        </div>
      )}
    </div>
  );
}

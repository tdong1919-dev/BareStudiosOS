import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Brand Brain - Bare Studios OS" };

const fields = [
  ["Business", "Bare Studios"],
  ["Tone", "Calm, elevated, direct, polished, warm"],
  ["Services", "Barbering, lashes, brows, facials, waxing, skin treatments"],
  ["Offers", "Last-minute openings, honest review gifts, facial upgrade prompts"],
  ["Allowed CTAs", "Request appointment, reload wallet, book refill, speak to concierge"],
  ["Avoid", "Discount-heavy language, exaggerated claims, generic beauty captions"],
  ["Emoji rule", "Minimal; only when it fits the platform"],
  ["Brand examples", "Maintenance over pressure. Care over chaos. Beauty that feels personal."],
];

export default async function BrandBrainPage() {
  await requireSession();
  return (
    <PageShell eyebrow="Marketing" title="Brand Brain." intro="Control the brand rules behind every generated caption, promotion, reply, and assistant recommendation." wide>
      <section className="grid gap-3 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <label key={label} className="rounded-xl border border-border bg-surface p-4">
            <span className="text-xs uppercase tracking-[0.14em] text-text-muted">{label}</span>
            <textarea className="mt-3 min-h-20 w-full rounded-md border border-border bg-white px-3 py-2 text-sm" defaultValue={value} />
          </label>
        ))}
      </section>
      <p className="mt-4 rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary">
        Demo mode: saving into a BrandBrain sheet tab is the next connection. Generated content should read these fields before producing copy.
      </p>
    </PageShell>
  );
}

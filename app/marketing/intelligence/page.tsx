import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Marketing Intelligence - Bare Studios OS" };

const intel = [
  ["Competitor move", "Nearby studios are promoting glass skin facials. Suggest dermaplaning + jelly mask bundle this week."],
  ["Search shift", "Nanoblading is searched 40% more than microblading. Consider a brows education post and service test."],
  ["Content opportunity", "Short checkout videos with retail recommendations are outperforming static promos."],
  ["Report input", "Use product sales, client retention, review count, bookings, and campaign revenue before recommending offers."],
];

export default async function IntelligencePage() {
  await requireSession();
  return (
    <PageShell eyebrow="Marketing" title="Competitor and content intelligence." intro="Use market signals, competitor movement, and report data to decide what Bare Studios should post, offer, and test next." wide>
      <div className="grid gap-4 md:grid-cols-2">
        {intel.map(([label, copy]) => (
          <article key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="font-medium">{label}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

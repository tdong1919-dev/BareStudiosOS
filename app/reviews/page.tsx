import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import ReviewForm from "@/components/agents/ReviewForm";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Reviews Assistant — Bare Studios OS",
  description: "Every review from Google, the website, and old booking sites, gathered in one place with smart response workflows.",
};

export const revalidate = 300;

type Review = { name: string; rating: number; source: string; review: string; date: string };

const SAMPLE: Review[] = [
  { name: "Maya R.", rating: 5, source: "Google", review: "Best balayage I've ever had. The wallet checkout was so easy.", date: "" },
  { name: "Daniela P.", rating: 5, source: "Website", review: "They remembered exactly what I wanted from last time. Felt so taken care of.", date: "" },
  { name: "Joss T.", rating: 4, source: "Google", review: "Lovely space, great results, easy to rebook from the app.", date: "" },
];

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5`} style={{ color: "#9A7B4F", letterSpacing: "1px" }}>
      {"★".repeat(Math.max(0, Math.min(5, n)))}
      <span style={{ color: "var(--color-border)" }}>{"★".repeat(5 - Math.max(0, Math.min(5, n)))}</span>
    </span>
  );
}

export default async function ReviewsPage() {
  const rows = await readSheetTab("Reviews");
  const live: Review[] = rows
    .map((r) => ({
      name: r.Name || "Anonymous",
      rating: Math.round(Number(r.Rating) || 0),
      source: r.Source || "Website",
      review: r.Review || "",
      date: r.Date || "",
    }))
    .filter((r) => r.review && r.rating >= 1);

  const reviews = live.length > 0 ? live : SAMPLE;
  const isSample = live.length === 0;
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;

  return (
    <PageShell
      eyebrow="Assistant · Reviews"
      title="What clients are saying."
      intro="Every review — from Google, your website, and old booking tools — gathered in one place. Positive reviews get unique response drafts, reviews under 3 stars get a professional manager follow-up, and the assigned owner or manager is notified."
      note={isSample ? "Showing sample reviews. Connect SHEETS_SHEET_ID (link-view) and add a Reviews tab to show your own." : undefined}
    >
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-serif text-4xl font-medium">{avg.toFixed(1)}</span>
        <Stars n={Math.round(avg)} />
        <span className="text-sm text-text-secondary">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div key={i} className="bg-surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <Stars n={r.rating} />
              <span className="text-[11px] uppercase tracking-[0.12em] text-text-muted">{r.source}</span>
            </div>
            <p className="text-sm leading-relaxed text-text-primary">&ldquo;{r.review}&rdquo;</p>
            <p className="mt-3 text-xs text-text-secondary">{r.name}{r.date ? ` · ${r.date}` : ""}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-serif text-2xl font-medium">Leave a review</h2>
        <ReviewForm />
      </div>
    </PageShell>
  );
}

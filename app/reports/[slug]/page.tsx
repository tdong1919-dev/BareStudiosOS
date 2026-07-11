import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Report Detail - Bare Studios OS" };

function titleFromSlug(slug: string) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function csvHref(rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSession();
  const { slug } = await params;
  const title = titleFromSlug(slug);
  const reportRows = [
    ["Report", "Metric", "Value"],
    [title, "This month", "$18,420"],
    [title, "Last month", "$15,980"],
    [title, "Change", "+15.3%"],
    [title, "Assistant summary", "Supplies increased 15% for two months. Retail attach rate rose to 31%. Rebooking is strongest before checkout."],
  ];
  return (
    <PageShell eyebrow="Reports" title={`${title}.`} intro="Demo report data now, live Google Sheets and payment/booking data later. Financial, inventory, marketing, reviews, and receptionist assistants should read this report layer before giving recommendations." wide>
      <a href={csvHref(reportRows)} download={`bare-studios-${slug}.csv`} className="mb-5 inline-flex rounded-md bg-gradient-brand px-4 py-2 text-sm font-medium text-white">
        Download CSV
      </a>
      <section className="grid gap-4 md:grid-cols-4">
        {[["This month", "$18,420"], ["Last month", "$15,980"], ["Change", "+15.3%"], ["Agent confidence", "Demo"]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="font-serif text-2xl font-medium">Assistant-readable summary</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Supplies increased 15% for two months. Retail attach rate rose to 31%. Rebooking is strongest when the provider offers the next appointment before checkout. Suggested action: review pricing, cue checkout add-ons, and have the Financial Assistant include this in the weekly executive document.
        </p>
      </section>
    </PageShell>
  );
}

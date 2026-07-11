import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import PromotionBuilder from "@/components/agents/PromotionBuilder";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Marketing - Bare Studios OS",
  description: "Promotions, social smart scheduling, content analytics, competitor intelligence, caption generation, and brand brain.",
};

const metrics = [
  ["Texts sent", "842", "+18% vs last promo"],
  ["Emails sent", "1,204", "94% delivered"],
  ["Open rate", "41%", "Email + SMS combined"],
  ["Book rate", "12.8%", "154 bookings attributed"],
  ["Promos used", "31%", "Clients who redeemed"],
  ["Revenue generated", "$18,420", "Tracked at checkout"],
  ["New clients", "37", "Since campaign launch"],
  ["Overdue clients returned", "62", "Win-back audience"],
];

const campaigns = [
  ["Lash refill win-back", "SMS + email", "Lapsed 45+ days", "$6,840", "18.4% booked"],
  ["Facial glow week", "Email", "Skin clients", "$4,210", "9.7% booked"],
  ["Retail cleanser attach", "Checkout", "Lash services", "$2,360", "31% redeemed"],
];

const tools = [
  {
    href: "/marketing/scheduler",
    eyebrow: "Smart scheduler",
    title: "Social content calendar",
    copy: "Schedule posts for Instagram, Facebook, YouTube, Google Business Profile, and TikTok when it is ready.",
    note: "Best next slot: Instagram Reel, Tuesday 10:00 AM",
  },
  {
    href: "/marketing/brand-brain",
    eyebrow: "Brand Brain",
    title: "Control generated content",
    copy: "Set voice, offers, services, pricing, CTAs, FAQs, emoji rules, and brand examples before any caption is generated.",
    note: "Voice: calm, elevated, direct",
  },
  {
    href: "/marketing/intelligence",
    eyebrow: "Competitor intelligence",
    title: "Scan content ideas",
    copy: "Track competitor moves, search shifts, content opportunities, and recommendations for what Bare Studios should post next.",
    note: "Nanoblading searches +40% vs microblading",
  },
  {
    href: "/marketing/captions",
    eyebrow: "Caption generator",
    title: "Generate platform copy",
    copy: "Generate captions using Brand Brain, report data, client segments, promotions, and platform context.",
    note: "Draft: Sunday skin reset campaign",
  },
];

export default async function PromotionsPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Marketing"
      title="Campaigns, content, and growth."
      intro="Create promotions, schedule social content, track what actually booked, and use the brand brain to keep generated content aligned with Bare Studios."
      note="Marketing tools use demo data now, then connect into reports, social APIs, and agent recommendations as the integrations go live."
      wide
    >
      <PromotionBuilder />

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Previous promotion analytics</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value, note]) => (
            <Link key={label} href={`/reports/${encodeURIComponent(label.toLowerCase().replaceAll(" ", "-"))}`} className="rounded-md border border-border bg-white p-4 transition hover:bg-surface-elevated">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{label}</p>
              <p className="mt-2 font-serif text-3xl font-medium">{value}</p>
              <p className="mt-1 text-xs text-text-secondary">{note}</p>
            </Link>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {campaigns.map(([name, channel, audience, revenue, booked], i) => (
            <Link href={`/reports/${encodeURIComponent(name.toLowerCase().replaceAll(" ", "-"))}`} key={name} className={`grid gap-2 bg-white p-4 text-sm transition hover:bg-surface-elevated md:grid-cols-5 ${i > 0 ? "border-t border-border" : ""}`}>
              <strong>{name}</strong>
              <span>{channel}</span>
              <span>{audience}</span>
              <span>{revenue}</span>
              <span>{booked}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="rounded-xl border border-border bg-surface p-6 transition hover:bg-surface-elevated">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{tool.eyebrow}</p>
            <p className="mt-4 font-serif text-2xl font-medium">{tool.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tool.copy}</p>
            <p className="mt-4 text-xs text-success">{tool.note}</p>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import PromotionBuilder from "@/components/agents/PromotionBuilder";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Marketing — Bare Studios OS",
  description: "Promotions, campaign analytics, smart scheduling, competitor intelligence, caption generation, and brand brain.",
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

const scheduler = [
  ["Tuesday 10:00 AM", "Best for lapsed lash refill clients", "Predicted 22 bookings"],
  ["Friday 1:30 PM", "Retail add-on reminder before weekend", "Predicted $1,200 retail"],
  ["Sunday 6:00 PM", "Next-week opening fill campaign", "Predicted 14 bookings"],
];

const ideas = [
  ["Competitor move", "Nearby studios are pushing 'glass skin' facials. Create a dermaplaning + jelly mask bundle this week."],
  ["Caption generator", "Your Sunday reset just got easier. Book a Bare SKN facial and leave with skin that looks rested before Monday starts."],
  ["Brand brain", "Voice: calm, elevated, direct. Avoid discount-heavy language; frame offers as access, care, and maintenance."],
  ["Content intelligence", "Short videos showing checkout product recommendations are outperforming static promos. Film one provider cue per service."],
];

export default async function PromotionsPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Marketing"
      title="Campaigns, content, and growth."
      intro="Create promotions, schedule messages, track what actually booked, and use the brand brain to turn service trends into content ideas. Promotions also appear inside Checkout so the team can apply the right offer before payment."
      note="Promotion metrics are currently sample analytics for the MVP dashboard. Saved campaigns live in the Promotions tab and can be connected to SMS/email delivery next."
      wide
    >
      <PromotionBuilder />

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Previous promotion analytics</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value, note]) => (
            <div key={label} className="rounded-md border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{label}</p>
              <p className="mt-2 font-serif text-3xl font-medium">{value}</p>
              <p className="mt-1 text-xs text-text-secondary">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {campaigns.map(([name, channel, audience, revenue, booked], i) => (
            <div key={name} className={`grid gap-2 bg-white p-4 text-sm md:grid-cols-5 ${i > 0 ? "border-t border-border" : ""}`}>
              <strong>{name}</strong>
              <span>{channel}</span>
              <span>{audience}</span>
              <span>{revenue}</span>
              <span>{booked}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Smart scheduler</p>
          <div className="mt-4 space-y-3">
            {scheduler.map(([time, reason, result]) => (
              <div key={time} className="rounded-md border border-border bg-white p-4 text-sm">
                <p className="font-medium">{time}</p>
                <p className="mt-1 text-text-secondary">{reason}</p>
                <p className="mt-1 text-xs text-success">{result}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Brand brain + intelligence</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ideas.map(([label, copy]) => (
              <div key={label} className="rounded-md border border-border bg-white p-4 text-sm leading-relaxed">
                <p className="font-medium">{label}</p>
                <p className="mt-2 text-text-secondary">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

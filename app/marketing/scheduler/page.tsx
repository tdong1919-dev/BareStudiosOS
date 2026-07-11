import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Social Smart Scheduler - Bare Studios OS" };

const platforms = [
  ["Instagram", "Connected soon", "Reels, posts, stories"],
  ["Facebook", "Connected soon", "Posts, reels, events"],
  ["YouTube", "Connected soon", "Shorts and long-form reminders"],
  ["Google Business Profile", "Connected soon", "Updates, offers, photos"],
  ["TikTok", "Coming soon", "API setup in progress"],
];

const queue = [
  ["Instagram Reel", "Tuesday 10:00 AM", "Lash refill POV with cleanser add-on", "High confidence"],
  ["Google Business Profile", "Thursday 12:00 PM", "BARE SKN facial opening + review prompt", "Medium confidence"],
  ["YouTube Short", "Sunday 6:00 PM", "What to expect during a dermaplaning facial", "Medium confidence"],
];

export default async function SchedulerPage() {
  await requireSession();
  return (
    <PageShell eyebrow="Marketing" title="Social smart scheduler." intro="Plan and publish social content across connected channels. Timing recommendations use booking, promotion, client, and report data." wide>
      <section className="grid gap-3 md:grid-cols-5">
        {platforms.map(([name, status, note]) => (
          <div key={name} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium">{name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-text-muted">{status}</p>
            <p className="mt-2 text-sm text-text-secondary">{note}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="font-serif text-2xl font-medium">Recommended queue</p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          {queue.map(([platform, time, content, confidence], i) => (
            <div key={content} className={`grid gap-2 bg-white p-4 text-sm md:grid-cols-4 ${i > 0 ? "border-t border-border" : ""}`}>
              <strong>{platform}</strong><span>{time}</span><span>{content}</span><span className="text-success">{confidence}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

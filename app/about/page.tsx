import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicSiteHeader from "@/components/app/PublicSiteHeader";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "About — Bare Studios",
  description: "Learn about Bare Studios, a beauty salon and studio suite community in Downtown Bel Air.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{children}</p>;
}

const IMAGE_BASE = "/images/bare-studios";

const ABOUT_REVIEWS = [
  {
    name: "Courtney T",
    service: "Lashes",
    text: "Really personable and experienced. The appointment felt comfortable from start to finish, and I left with exactly the look I asked for.",
  },
  {
    name: "Anna H",
    service: "Waxing",
    text: "Professional, kind, and knowledgeable. The service was easy, comfortable, and I felt confident coming back for future appointments.",
  },
  {
    name: "Kara D",
    service: "Waxing",
    text: "Clean studio, easy conversation, and a relaxing experience. I would absolutely recommend booking here.",
  },
  {
    name: "Shelby S",
    service: "Skin + beauty",
    text: "The service felt thoughtful and calming. I felt taken care of throughout the appointment and loved the final result.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PublicSiteHeader />

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 sm:py-24 md:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            Welcome to the tribe.
          </h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-text-secondary">
            <p>
              Bare Studios is more than a beauty salon. It is a calm, supportive space where clients can reconnect
              with themselves and beauty professionals can build their own businesses inside a collaborative studio.
            </p>
            <p>
              The studio offers in-house esthetic services, lash and brow treatments, waxing, permanent brows, and
              advanced skin services in Downtown Bel Air.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="rounded-sm bg-gradient-brand px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white">
              Book an appointment
            </Link>
            <Link href="/suite-rental" className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em]">
              Rent + careers
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-surface-elevated">
          <div className="relative aspect-[4/3] bg-linen">
            <Image src={`${IMAGE_BASE}/bare-studios-tools-station.png`} alt="Bare Studios hair and beauty tools" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="p-8">
            <Eyebrow>Location</Eyebrow>
            <p className="mt-4 font-serif text-3xl font-medium">{BARE_STUDIOS.address}</p>
            <p className="mt-4 text-text-secondary">{BARE_STUDIOS.phone}</p>
            <p className="mt-6 text-sm leading-relaxed text-text-secondary">
              We believe self-care should feel guilt-free, personal, and restorative. Whether you are coming in for
              glowing skin, low-maintenance lashes, brows, waxing, or permanent makeup, the experience is designed to
              help you feel taken care of from the moment you arrive.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-6">
          <Eyebrow>What clients say</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-medium">Kind words from the chair.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {ABOUT_REVIEWS.map((review) => (
            <article key={review.name} className="rounded-md border border-border bg-surface p-6">
              <p className="text-sm font-medium text-success">★★★★★</p>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">{review.text}</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-serif text-2xl">{review.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-text-muted">{review.service}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["bare-studios-facial-treatment.png", "Bare Studios facial treatment"],
            ["bare-studios-blonde-hair.png", "Bare Studios hair service"],
            ["bare-studios-tools-station.png", "Bare Studios tools station"],
          ].map(([file, label]) => (
            <div key={file} className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-linen">
              <Image src={`${IMAGE_BASE}/${file}`} alt={label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "About — Bare Studios",
  description: "Learn about Bare Studios, a beauty salon and studio suite community in Downtown Bel Air.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{children}</p>;
}

const IMAGE_BASE = "/images/bare-studios";

export default function AboutPage() {
  return (
    <main>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-serif text-lg tracking-wide">
            Bare Studios
          </Link>
          <Link href="/book" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Book now
          </Link>
        </div>
      </header>

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
            <Image src={`${IMAGE_BASE}/bare-studios-portrait.jpg`} alt="Bare Studios" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 pb-20 md:grid-cols-4">
        {[
          ["bare-studios-gallery-01.jpg", "Bare Studios studio detail"],
          ["bare-studios-gallery-03.jpg", "Bare Studios interior"],
          ["bare-studios-gallery-06.jpg", "Bare Studios service space"],
          ["bare-studios-gallery-08.jpg", "Bare Studios beauty room"],
        ].map(([file, label]) => (
          <div key={file} className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-linen">
            <Image src={`${IMAGE_BASE}/${file}`} alt={label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          </div>
        ))}
      </section>
    </main>
  );
}

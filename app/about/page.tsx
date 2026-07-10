import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — JIDOKA Cosmetics OS",
  description:
    "About Crystal Thuy Dong, JIDOKA Group, and the consulting plus implementation mission behind JIDOKA Cosmetics OS.",
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-5xl px-5 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{children}</p>;
}

export default function AboutPage() {
  return (
    <main>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-serif text-lg tracking-wide">
            JIDOKA <span className="text-text-secondary">Cosmetics OS</span>
          </Link>
          <Link href="/" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Back to overview
          </Link>
        </div>
      </header>

      <Section className="py-16 sm:py-24">
        <div className="max-w-3xl">
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            Built from almost a decade inside beauty businesses.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            Crystal Thuy Dong has been building full-service salons since 2017, giving her a direct view into
            the operational pressure that cosmetic businesses face at every stage.
          </p>
        </div>
      </Section>

      <Section className="pb-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-border bg-surface-elevated p-6">
            <Eyebrow>Crystal Thuy Dong</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-medium">Founder, operator, educator, builder.</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Crystal&apos;s work spans salon ownership, education, marketing, product partnerships, and business
              implementation. That range is what shapes JIDOKA Cosmetics OS: practical systems built for real
              teams, not theory.
            </p>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-text-secondary">
            <p>
              Since 2017, Crystal has built and operated full-service salons, served as an international educator
              for Socolashes California, spoken at beauty conferences, sold online courses, and received mentorship
              through industry experts from New York and Los Angeles.
            </p>
            <p>
              She has been featured in Eyelash Magazine and has worked with major beauty brands and industry
              platforms including Illumino, PMD, Dermalogica, Beautifulwandz, and LashCon.
            </p>
            <p>
              Crystal also ran a marketing agency for five years, servicing salons, spas, medspas, and plastic
              surgeons. When it comes to the struggles cosmetic businesses deal with, that almost-decade of
              experience means she understands the path from solopreneur to enterprise level.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-24">
        <div className="rounded-lg border border-border bg-white p-8 text-center sm:p-12">
          <a
            href="https://jidokagroup.com"
            target="_blank"
            rel="noreferrer"
            className="mx-auto block w-full max-w-[440px]"
            aria-label="Visit Jidoka Group"
          >
            <Image
              src="/jidoka-group-logo.png"
              alt="Jidoka Group"
              width={440}
              height={132}
              className="h-auto w-full"
              priority={false}
            />
          </a>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-text-secondary">
            <p>
              JIDOKA Group exists to help founders make their businesses more efficient, competitive, and profitable
              without losing the human judgment that makes their work matter. JIDOKA Cosmetics OS is one expression
              of that mission for salons, spas, medspas, and cosmetic businesses: an operating system that uses
              automation and assistants to remove the daily pressure points that keep owners stuck in the weeds.
            </p>
            <p>
              The goal is not to replace people with software. It is to give founders and teams the systems,
              visibility, and implementation support they need so the business can work for them, while they stay
              connected to the life and work they actually want to build.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}

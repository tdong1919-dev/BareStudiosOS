import Link from "next/link";
import { BARE_SERVICE_CATEGORIES, BARE_STUDIOS } from "@/lib/bare-studios";

const FEATURED_SERVICES = [
  {
    name: "Dermalogica Luminfusion",
    detail: "Glass-skin glow, radiance, and smoother texture.",
    href: "/book?service=Dermalogica%20Luminfusion%20%2F%20Glass%20Skin%20Facial",
  },
  {
    name: "Microneedling",
    detail: "A collagen-focused treatment for texture, tone, and renewal.",
    href: "/book?service=Microneedling",
  },
  {
    name: "Lash lifts + brows",
    detail: "Low-maintenance definition for lashes, brows, and everyday confidence.",
    href: "/book?service=Lash%20Lift%20and%20Tint",
  },
];

const REVIEWS = [
  "Beautiful space, relaxing energy, and my skin was glowing when I left.",
  "The team made me feel comfortable and explained every step before my service.",
  "I finally found a place for facials, brows, and lashes that feels personal.",
];

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-5 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{children}</p>;
}

function BookButton({ children = "Book an appointment", href = "/book" }: { children?: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-sm bg-gradient-brand px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}

function SalonImage({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`salon-image relative overflow-hidden rounded-md border border-border ${className}`}>
      <div className="absolute inset-0 salon-image-glow" />
      <div className="absolute inset-x-5 bottom-5 rounded-md border border-white/45 bg-white/72 p-4 backdrop-blur-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function BareStudiosHomePage() {
  return (
    <main>
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-serif text-xl tracking-wide">
            Bare Studios
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
              Services
            </a>
            <a href="#about" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
              About
            </a>
            <a href="#contact" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
              Contact
            </a>
            <Link href="/suite-rental" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
              Suite rentals
            </Link>
          </nav>
          <BookButton>Book now</BookButton>
        </div>
      </header>

      <Section className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-10 py-12 md:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Eyebrow>Downtown Bel Air beauty studio</Eyebrow>
          <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.03] tracking-tight sm:text-7xl">
            Facials, lashes, brows, and skin treatments made personal.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Bare Studios is a welcoming beauty salon and studio collective in Bel Air, Maryland, offering
            in-house esthetic services, permanent brows, lash lifts, waxing, and restorative skin treatments.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton />
            <a
              href="#services"
              className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-black/[0.04]"
            >
              View services
            </a>
          </div>
          <p className="mt-5 text-sm text-text-secondary">{BARE_STUDIOS.address} · {BARE_STUDIOS.phone}</p>
        </div>
        <div className="grid grid-cols-[0.75fr_1fr] gap-4">
          <SalonImage label="Skin studio" className="aspect-[3/4] translate-y-10" />
          <div className="space-y-4">
            <SalonImage label="Lashes + brows" className="aspect-[4/3]" />
            <div className="rounded-md border border-border bg-surface-elevated p-5">
              <p className="font-serif text-3xl font-medium">New services added</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Luminfusion, microneedling, chemical peels, microblading, powder brows, and nano brows.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="services" className="py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Services</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl font-medium">Choose your next appointment.</h2>
          </div>
          <BookButton>Start booking</BookButton>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURED_SERVICES.map((service) => (
            <Link key={service.name} href={service.href} className="group rounded-md border border-border bg-surface p-6 transition-colors hover:bg-surface-elevated">
              <p className="font-serif text-2xl font-medium">{service.name}</p>
              <p className="mt-3 min-h-16 text-sm leading-relaxed text-text-secondary">{service.detail}</p>
              <span className="mt-5 inline-flex text-[12px] uppercase tracking-[0.14em] text-text-primary">Book this service</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
          {BARE_SERVICE_CATEGORIES.map((category) => (
            <div key={category.name} className="bg-white p-6">
              <h3 className="font-serif text-2xl font-medium">{category.name}</h3>
              <div className="mt-4 space-y-3">
                {category.services.map((service) => (
                  <Link key={service.name} href={`/book?service=${encodeURIComponent(service.name)}`} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0">
                    <span className="text-sm text-text-primary">{service.name}</span>
                    <span className="shrink-0 text-xs text-text-muted">{service.duration}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="about" className="grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-[0.9fr_1.1fr]">
        <SalonImage label="Welcome to the tribe" className="aspect-[4/5]" />
        <div>
          <Eyebrow>About Bare Studios</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-medium">A place to relax, recharge, and feel like yourself again.</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-text-secondary">
            <p>
              Bare Studios is more than a beauty salon. It is a supportive studio home for independent beauty
              professionals and a calm destination for clients who want thoughtful, high-quality care.
            </p>
            <p>
              Come in for facials, peels, microneedling, waxing, lashes, brows, and permanent makeup services
              designed to take stress off your plate and help you feel confident in your skin.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book your visit</BookButton>
            <Link
              href="/suite-rental"
              className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-black/[0.04]"
            >
              Apply for a suite
            </Link>
          </div>
        </div>
      </Section>

      <Section className="py-20">
        <div className="mb-8 text-center">
          <Eyebrow>What clients say</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-medium">Soft, skilled, and confidence-building.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure key={review} className="rounded-md border border-border bg-surface-elevated p-6">
              <blockquote className="font-serif text-2xl leading-snug">&ldquo;{review}&rdquo;</blockquote>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="contact" className="pb-24 pt-12">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-[1fr_0.9fr]">
          <div className="bg-surface-elevated p-8 sm:p-10">
            <Eyebrow>Visit us</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl font-medium">Book your Bare Studios appointment.</h2>
            <div className="mt-6 space-y-3 text-text-secondary">
              <p>{BARE_STUDIOS.address}</p>
              <p>{BARE_STUDIOS.phone}</p>
              <p>Downtown Bel Air, Maryland</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>Request appointment</BookButton>
              <a
                href={`tel:${BARE_STUDIOS.phone.replace(/[^0-9]/g, "")}`}
                className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-black/[0.04]"
              >
                Call the studio
              </a>
            </div>
          </div>
          <div className="flex min-h-[360px] items-center justify-center bg-white p-8">
            <div className="w-full rounded-md border border-border p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Booking note</p>
              <p className="mt-3 font-serif text-3xl font-medium">Choose your service, preferred time, and artist.</p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Your appointment request is sent directly to Bare Studios so the team can confirm availability and
                follow up with any preparation details before your visit.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

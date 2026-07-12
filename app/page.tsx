import Link from "next/link";
import Image from "next/image";
import { BARE_SERVICE_CATEGORIES, BARE_STUDIOS } from "@/lib/bare-studios";

const FEATURED_SERVICES = [
  {
    name: "Barber",
    price: "Call Andy",
    detail: "Clean cuts, grooming, and unisex barbering with Andy.",
    href: "/book?service=Barbering%20with%20Andy",
  },
  {
    name: "Classic Lash Extensions",
    price: "$150",
    detail: "A soft, polished lash set customized to your everyday look.",
    href: "/book?service=Classic%20Lash%20Extensions",
  },
  {
    name: "Custom Facial",
    price: "$95",
    detail: "A customized facial designed to rebalance, hydrate, and brighten the skin.",
    href: "/book?service=BARE%20SKN%20Signature%20Facial%20(Tier%201)",
  },
];

const GOOGLE_REVIEW_URL = "https://share.google/YiUtDBNAjtVdfTYm6";

const GOOGLE_REVIEWS = [
  {
    name: "Google Reviews",
    text: "Read verified Google reviews from clients who visit Bare Studios for beauty, waxing, lashes, skin, and barbering services.",
  },
  {
    name: "Google Reviews",
    text: "Clients can open the Google review page to see the latest public feedback, ratings, and client experiences.",
  },
  {
    name: "Google Reviews",
    text: "Have a recent visit to share? Leave Bare Studios a Google review so new clients can find the right service with confidence.",
  },
];

const IMAGE_BASE = "/images/bare-studios";

const SCREENSHOT_REVIEWS = [
  { src: `${IMAGE_BASE}/bare-studios-gallery-01.jpg`, label: "Kandy M review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-02.jpg`, label: "Kara D review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-03.jpg`, label: "Jocelyn G review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-04.jpg`, label: "Morgan B review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-05.jpg`, label: "Janelle L review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-06.jpg`, label: "Anna H review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-07.jpg`, label: "Juliana S review" },
  { src: `${IMAGE_BASE}/bare-studios-gallery-08.jpg`, label: "Shelby S review" },
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

function SalonImage({ label, src, className = "", showLabel = true }: { label: string; src: string; className?: string; showLabel?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-md border border-border bg-linen ${className}`}>
      <Image src={src} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/8" />
      {showLabel ? (
        <div className="absolute inset-x-5 bottom-5 rounded-md border border-white/45 bg-white/72 p-4 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</p>
        </div>
      ) : null}
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
              Rent + Careers
            </Link>
          </nav>
          <BookButton>Book now</BookButton>
        </div>
      </header>

      <Section className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-10 py-12 md:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Eyebrow>Downtown Bel Air beauty studio</Eyebrow>
          <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.03] tracking-tight sm:text-7xl">
            Barber, hair, lashes, brows, and skin treatments made personal.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Bare Studios is a welcoming beauty salon and studio collective in Bel Air, Maryland, offering
            barbering, hair, lash services, brows, waxing, facials, and restorative skin treatments.
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
          <SalonImage label="Bare Studios storefront" src={`${IMAGE_BASE}/bare-studios-portrait.jpg`} className="aspect-[3/4] translate-y-10" showLabel={false} />
          <div className="space-y-4">
            <SalonImage label="Bare Studios facial treatment" src={`${IMAGE_BASE}/bare-studios-facial-treatment.png`} className="aspect-[4/3]" showLabel={false} />
            <div className="rounded-md border border-border bg-surface-elevated p-5">
              <p className="font-serif text-3xl font-medium">NOW HIRING</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Cosmetologists, estheticians, barbers, and suite rentals available.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-12">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Client love</Eyebrow>
            <h2 className="mt-2 font-serif text-3xl font-medium">Reviews from Google and past booking platforms.</h2>
          </div>
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer" className="text-[12px] uppercase tracking-[0.14em] text-text-primary underline underline-offset-4">
            Open Google reviews
          </a>
        </div>
        <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4">
          {GOOGLE_REVIEWS.map((review, index) => (
            <a
              key={`${review.name}-${index}`}
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[360px] w-[300px] shrink-0 snap-start flex-col justify-between rounded-md border border-border bg-surface-elevated p-6 transition hover:bg-linen sm:w-[360px]"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Google</p>
                <p className="mt-3 text-lg font-medium text-success">★★★★★</p>
                <p className="mt-5 font-serif text-2xl leading-snug">{review.text}</p>
              </div>
              <p className="mt-6 text-[12px] uppercase tracking-[0.14em] text-text-secondary">{review.name}</p>
            </a>
          ))}
          {SCREENSHOT_REVIEWS.map((review) => (
            <Link
              key={review.src}
              href="/book"
              className="relative h-[360px] w-[300px] shrink-0 snap-start overflow-hidden rounded-md border border-border bg-white p-3 transition hover:bg-surface-elevated sm:w-[360px]"
            >
              <Image src={review.src} alt={review.label} fill sizes="360px" className="object-contain p-3" />
            </Link>
          ))}
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
              <div className="flex items-start justify-between gap-4">
                <p className="font-serif text-2xl font-medium">{service.name}</p>
                <span className="shrink-0 text-sm text-text-muted">{service.price}</span>
              </div>
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
                    <span className="shrink-0 text-xs text-text-muted">{service.price} · {service.duration}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="about" className="grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-[0.9fr_1.1fr]">
        <SalonImage label="Welcome to the tribe" src={`${IMAGE_BASE}/bare-studios-portrait.jpg`} className="aspect-[4/5]" />
        <div>
          <Eyebrow>About Bare Studios</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-medium">A place to relax, recharge, and feel like yourself again.</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-text-secondary">
            <p>
              Bare Studios is more than a barber and beauty shop. It is a supportive studio home for independent beauty
              professionals and a calm destination for clients who want thoughtful, high-quality care.
            </p>
            <p>
              Come in for unisex services including barbering, lash services, facials, and more, all designed
              to take stress off your plate and help you feel confident in your skin.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book your visit</BookButton>
            <Link
              href="/suite-rental"
              className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-black/[0.04]"
            >
              Rent + careers
            </Link>
          </div>
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
                href={`tel:${BARE_STUDIOS.conciergePhone.replace(/[^0-9]/g, "")}`}
                className="rounded-sm border border-text-primary/30 px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-black/[0.04]"
              >
                Speak to Concierge
              </a>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden bg-linen">
            <Image src={`${IMAGE_BASE}/bare-studios-waxing-room.jpg`} alt="Bare Studios treatment room" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-x-8 bottom-8 rounded-md border border-border bg-white/86 p-6 backdrop-blur-sm">
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
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>© Bare Studios</span>
          <Link href="/login" className="text-[12px] uppercase tracking-[0.14em] text-text-primary hover:opacity-70">Admin login</Link>
        </div>
      </footer>
    </main>
  );
}

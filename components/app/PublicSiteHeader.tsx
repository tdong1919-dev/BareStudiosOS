import Link from "next/link";

export default function PublicSiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-serif text-xl tracking-wide">
          Bare Studios
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#services" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Services
          </Link>
          <Link href="/about" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            About
          </Link>
          <Link href="/#contact" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Contact
          </Link>
          <Link href="/suite-rental" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Rent + Careers
          </Link>
        </nav>
        <Link
          href="/book"
          className="inline-flex rounded-sm bg-gradient-brand px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
        >
          Book now
        </Link>
      </div>
    </header>
  );
}

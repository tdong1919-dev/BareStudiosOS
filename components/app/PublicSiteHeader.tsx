import Link from "next/link";

export default function PublicSiteHeader() {
  const navItems = [
    { href: "/#services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/#contact", label: "Contact" },
    { href: "/suite-rental", label: "Rent + Careers" },
  ];

  return (
    <header className="public-page-enter sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="shrink-0 font-serif text-lg tracking-wide sm:text-xl">
          Bare Studios
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/book"
          className="inline-flex shrink-0 rounded-sm bg-gradient-brand px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 sm:px-7 sm:py-3.5 sm:text-[12px] sm:tracking-[0.14em]"
        >
          Book now
        </Link>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 pb-3 md:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

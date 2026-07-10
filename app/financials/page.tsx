import type { Metadata } from "next";
import Link from "next/link";
import FinancialAgent from "@/components/agents/FinancialAgent";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Financial Assistant — Bare Studios OS",
  description:
    "Talk to your salon's financial assistant: set commission rates, run payroll, and get plain-English advice to improve your bottom line.",
};

export default async function FinancialsPage() {
  await requireSession();
  return (
    <main>
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-5">
          <Link href="/" className="font-serif text-lg tracking-wide">
            Bare Studios <span className="text-text-secondary">OS</span>
          </Link>
          <Link href="/dashboard" className="text-[12px] uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary">
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 py-14 sm:py-20">
        <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">Assistant · Financials</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Your financial assistant.
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-text-secondary">
          Set commission structures, calculate payroll, and get monthly, plain-English advice to lift your
          margin. Every payroll number is computed precisely and saved to your own Google Sheet — nothing to
          install.
        </p>

        <div className="mt-8">
          <FinancialAgent />
        </div>

        <p className="mt-4 text-xs text-text-muted leading-relaxed">
          The assistant works from the figures you give it (it has no live access to your bank or POS). Commission
          settings save to a Staff tab and payroll runs to a Payroll tab in your sheet.
        </p>
      </section>
    </main>
  );
}

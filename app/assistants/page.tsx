import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Assistants — Bare Studios OS" };

const assistants = [
  { href: "/financials", name: "Financial Assistant", report: "$1,840 margin lift opportunity", note: "Payroll drafts, commission rules, wallet savings, supply spend." },
  { href: "/inventory", name: "Inventory Assistant", report: "3 reorder drafts ready", note: "Low stock alerts, reputable supplier search, COGS/Supplies categorization." },
  { href: "/reviews", name: "Reviews Assistant", report: "Google + Vagaro import queue", note: "Unique positive replies, under-3-star manager escalation, owner alerts." },
  { href: "/intelligence", name: "Industry Intelligence", report: "July trend brief", note: "Beauty trends, competitor moves, nanoblading/lash/facial demand signals." },
  { href: "/concierge", name: "Receptionist / Concierge", report: "Inbox connected to calls + chat", note: "Retell-ready phone concierge, website chat, SMS, Instagram routing." },
];

export default async function AssistantsPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Assistants"
      title="Five assistants, one Bare Studios command center."
      intro="Use each agent directly, review its report, and route client-facing work back into the dashboard without jumping between apps."
      wide
    >
      <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Agent roster</p>
          <div className="mt-4 space-y-2">
            {assistants.map((assistant) => (
              <Link key={assistant.name} href={assistant.href} className="block rounded-md border border-border bg-white p-4 hover:bg-surface-elevated">
                <p className="font-serif text-xl font-medium">{assistant.name}</p>
                <p className="mt-1 text-xs text-text-muted">{assistant.report}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">One-page executive summary</p>
          <h2 className="mt-3 font-serif text-3xl font-medium">This week at Bare Studios</h2>
          <div className="mt-5 grid gap-3">
            {assistants.map((assistant) => (
              <div key={assistant.name} className="rounded-md border border-border bg-white p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="font-medium">{assistant.name}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{assistant.report}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{assistant.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

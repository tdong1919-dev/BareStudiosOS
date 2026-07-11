import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Reports - Bare Studios OS" };

const groups = [
  ["Sales", ["Transaction list", "Sales summary", "Deposits", "Payment distribution", "Product sales", "Product sales by customer", "Services/classes", "Trends", "Combined report"]],
  ["Employees", ["Sales", "Customer retention", "Rebooking", "Rent collection", "Time card", "Payroll", "Payroll configuration", "Payroll history", "Print daily plan", "Time off"]],
  ["Customers", ["New vs returning", "Packages", "Memberships", "Gift cards", "IOU", "Failed payments", "Unsigned forms/SOAPs", "Check-in log", "Review management"]],
  ["Appointments", ["Source", "Appointments summary", "Missed checkouts/check-ins", "Booking percentage", "Cancellation & no-shows"]],
  ["Inventory", ["Stock trends", "Sales trends", "Inventory summary", "Sales by brand", "Sales by category", "Sales by product", "Current stock", "Unsold/unused products", "Inventory by status", "Pending shipments"]],
];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function csvHref(rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

export default async function ReportsPage() {
  await requireSession();
  const allRows = [["Category", "Report", "Status"], ...groups.flatMap(([title, items]) => (items as string[]).map((item) => [title as string, item, "Demo data ready"]))];
  return (
    <PageShell eyebrow="Reports" title="Reports dashboard." intro="A single place for sales, employees, customers, appointments, inventory, messaging, and payroll reports. Agents use this report layer for more accurate recommendations and actions." wide>
      <a href={csvHref(allRows)} download="bare-studios-all-reports.csv" className="mb-5 inline-flex rounded-md bg-gradient-brand px-4 py-2 text-sm font-medium text-white">
        Download all reports CSV
      </a>
      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map(([title, items]) => (
          <section key={title as string} className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">{title as string}</h2>
              <a href={csvHref([["Category", "Report", "Status"], ...(items as string[]).map((item) => [title as string, item, "Demo data ready"])])} download={`bare-studios-${slug(title as string)}-reports.csv`} className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium hover:bg-surface-elevated">
                Download CSV
              </a>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(items as string[]).map((item) => (
                <div key={item} className="grid gap-2 rounded-md border border-border bg-white p-2">
                  <Link href={`/reports/${slug(`${title}-${item}`)}`} className="text-left text-sm hover:underline">
                    {item}
                  </Link>
                  <a href={csvHref([["Category", "Report", "This month", "Last month", "Change"], [title as string, item, "$18,420", "$15,980", "+15.3%"]])} download={`bare-studios-${slug(`${title}-${item}`)}.csv`} className="text-xs text-text-secondary underline">
                    Download CSV
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

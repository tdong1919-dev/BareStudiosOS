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

export default async function ReportsPage() {
  await requireSession();
  return (
    <PageShell eyebrow="Reports" title="Reports dashboard." intro="A single place for sales, employees, customers, appointments, inventory, messaging, and payroll reports. Agents use this report layer for more accurate recommendations and actions." wide>
      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map(([title, items]) => (
          <section key={title as string} className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-serif text-2xl">{title as string}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(items as string[]).map((item) => (
                <Link key={item} href={`/reports/${slug(`${title}-${item}`)}`} className="rounded-md border border-border bg-white px-3 py-2 text-left text-sm hover:bg-surface-elevated">
                  {item}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

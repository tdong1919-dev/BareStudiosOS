import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import InventoryForm from "@/components/agents/InventoryForm";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inventory Assistant — Bare Studios OS",
  description: "Flag low stock and let the inventory assistant find the cheapest reputable place to reorder — with tax-ready categorization.",
};

export default async function InventoryPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Assistant · Inventory"
      title="Never run out mid-service."
      intro="Any team member flags a low product and the person who orders supplies is notified instantly. Ask the assistant to scan reputable suppliers for the cheapest reorder, and every item is filed under Supplies or Cost of Goods Sold to make taxes easier."
      note="Flags are logged to an Inventory tab in your sheet. Reorder suggestions use the web; prices are estimates — confirm at checkout."
    >
      <InventoryForm />
    </PageShell>
  );
}

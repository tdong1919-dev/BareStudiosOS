import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import InventoryForm from "@/components/agents/InventoryForm";
import { requireSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Inventory Assistant - Bare Studios OS",
  description: "Flag low stock and let the inventory assistant find the cheapest reputable place to reorder with tax-ready categorization.",
};

export default async function InventoryPage() {
  const session = await requireSession();
  const products = await readSheetTab("Products");
  const lowRetail = products
    .filter((r) => (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase())
    .map((r) => ({
      name: r.Name || "Retail product",
      inventory: Number(r.InitialInventory || r.Inventory) || 0,
      threshold: Number(r.ReorderThreshold || r.Threshold) || 10,
    }))
    .filter((p) => p.inventory < p.threshold);

  return (
    <PageShell
      eyebrow="Assistant · Inventory"
      title="Never run out mid-service."
      intro="Any team member flags a low product and the person who orders supplies is notified instantly. Retail products are monitored from the Products tab, with reminders when quantity falls below the threshold."
      note="Flags are logged to an Inventory tab in your sheet. Retail low-stock reminders default below 10 and can be adjusted on each product."
    >
      {lowRetail.length > 0 && (
        <section className="mb-6 rounded-xl border border-error/30 bg-error/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-error">Retail low-stock reminders</p>
          <div className="mt-3 space-y-2">
            {lowRetail.map((product) => (
              <div key={product.name} className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm">
                <span>{product.name}</span>
                <span className="text-error">{product.inventory} on hand · threshold {product.threshold}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <InventoryForm />
    </PageShell>
  );
}

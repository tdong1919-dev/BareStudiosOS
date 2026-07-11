import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import Storefront from "@/components/store/Storefront";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Shop — Bare Studios OS",
  description: "Buy your salon's at-home products online — checkout settles to the salon's own Stripe.",
};

export const revalidate = 60;

const SAMPLE_PRODUCTS = [
  {
    name: "Gloss Revival Mask",
    price: 38,
    description: "Color-safe hydration clients can use between gloss appointments.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    inventory: 18, threshold: 10,
  },
  {
    name: "Scalp Reset Serum",
    price: 42,
    description: "A lightweight scalp treatment to attach to refresh appointments.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    inventory: 11, threshold: 10,
  },
  {
    name: "Silk Finish Oil",
    price: 34,
    description: "The take-home finish for smooth styling after color services.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    inventory: 24, threshold: 10,
  },
];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const salon = typeof sp.salon === "string" ? sp.salon : "";
  const purchased = sp.purchased === "1";
  const demo = sp.demo === "1";

  const rows = demo ? [] : await readSheetTab("Products");
  const products = demo
    ? SAMPLE_PRODUCTS
    : rows
      .filter((r) => (r.Active || "yes").toLowerCase() !== "no")
      .filter((r) => (salon ? (r.Salon || "").trim().toLowerCase() === salon.trim().toLowerCase() : true))
      .map((r) => ({
        name: r.Name || "",
        price: Number(r.Price) || 0,
        description: r.Description || "",
        image: r.Image || "",
        inventory: Number(r.InitialInventory || r.Inventory) || undefined,
        threshold: Number(r.ReorderThreshold || r.Threshold) || 10,
      }))
      .filter((p) => p.name && p.price > 0);

  return (
    <PageShell
      eyebrow="Retail · Shop"
      title="Take the salon home."
      intro="Sell your at-home products online and ring up retail in-salon from the same catalog. Checkout settles directly to the salon's own Stripe — extend the experience and the revenue between visits."
      note={demo ? "Sample mode: products and purchases are simulated for the live demo." : "Products live in a Products tab; orders are recorded to an Orders tab via the Stripe webhook. Shop a specific salon with ?salon=Name in the URL."}
      showBottomBack
    >
      {purchased && <p className="mb-5 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">Thank you for your order!</p>}
      <Storefront products={products} salon={salon} demo={demo} />
    </PageShell>
  );
}

"use client";
/**
 * Storefront — buy retail products (Stripe Checkout on the salon's connected
 * account) and, for owners, add products. Used both for at-home online sales
 * and in-salon checkout.
 */
import { useState } from "react";

type Product = { name: string; price: number; description: string; image: string; inventory?: number };

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function Storefront({ products, salon, demo = false }: { products: Product[]; salon: string; demo?: boolean }) {
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "", inventory: "" });
  const [photoName, setPhotoName] = useState("");
  const [added, setAdded] = useState(false);
  const [sampleOrder, setSampleOrder] = useState<string | null>(null);

  function resetForm() {
    setForm({ name: "", price: "", description: "", image: "", inventory: "" });
    setPhotoName("");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((f) => ({ ...f, image: reader.result as string }));
        setPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  async function buy(p: Product) {
    if (demo) {
      setError(null);
      setSampleOrder(`${p.name} added to the sample order.`);
      return;
    }
    if (!salon) {
      setError("Add ?salon=Your%20Salon to the URL to shop a salon's store.");
      return;
    }
    setError(null);
    setBusy(p.name);
    try {
      const res = await fetch("/api/store/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ salon, name: p.name, price: p.price, qty: 1 }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        setError(json.error || "Couldn't start checkout.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const newProduct = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      description: form.description.trim(),
      image: form.image.trim(),
      inventory: Number(form.inventory) || 0,
    };
    if (!demo && !salon) {
      setError("Add ?salon=Your%20Salon to the URL first.");
      return;
    }
    if (!newProduct.name || !newProduct.price) {
      setError("Product name and price are required.");
      return;
    }
    setError(null);
    if (demo) {
      setCatalog((items) => [newProduct, ...items]);
      setAdded(true);
      resetForm();
      return;
    }
    try {
      const res = await fetch("/api/store/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salon, ...form, price: newProduct.price, initialInventory: newProduct.inventory }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Couldn't add the product.");
        return;
      }
      setCatalog((items) => [newProduct, ...items]);
      setAdded(true);
      resetForm();
    } catch {
      setError("Network error — please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-error">{error}</p>}
      {sampleOrder && <p className="rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">{sampleOrder}</p>}

      {catalog.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-elevated px-5 py-6 text-sm text-text-secondary">
          No products yet{salon ? ` for ${salon}` : ""}. {salon ? "Add one below." : "Add ?salon=Your%20Salon to the URL."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {catalog.map((p, i) => (
            <div key={i} className="flex flex-col bg-surface p-5">
              {p.image ? (
                <div
                  className="mb-3 aspect-[4/3] w-full rounded-md border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                  role="img"
                  aria-label={`${p.name} product photo`}
                />
              ) : (
                <div className="photo-frame mb-3 aspect-[4/3] w-full rounded-md border border-border" aria-hidden="true" />
              )}
              <p className="font-serif text-lg font-medium">{p.name}</p>
              {p.description && <p className="mt-1 text-sm text-text-secondary">{p.description}</p>}
              {typeof p.inventory === "number" && (
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-text-muted">Inventory: {p.inventory}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium">${p.price.toFixed(2)}</span>
                <button type="button" onClick={() => buy(p)} disabled={busy === p.name} className="rounded-sm bg-gradient-brand px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white disabled:opacity-50">
                  {busy === p.name ? "..." : demo ? "Add" : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          className="rounded-sm bg-gradient-brand px-8 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
        >
          {showAdd ? "Hide" : "Add a product"}
        </button>
        {showAdd && (
          <form onSubmit={addProduct} className="mt-3 rounded-xl border border-border bg-surface p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Product name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} aria-label="Name" />
              <input className={inputClass} type="number" placeholder="Price *" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} aria-label="Price" />
            </div>
            <input className={inputClass} type="number" min={0} placeholder="Initial inventory count" value={form.inventory} onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.value }))} aria-label="Initial inventory count" />
            <input className={inputClass} placeholder="Short description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} aria-label="Description" />
            <input className={inputClass} placeholder="Photo URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} aria-label="Photo URL" />
            <label className="block rounded-md border border-dashed border-border bg-white px-3 py-4 text-sm text-text-secondary">
              <span className="block text-[11px] uppercase tracking-[0.14em] text-text-muted">Upload product photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-3 block w-full text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-text-primary file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.12em] file:text-white" />
              {photoName && <span className="mt-2 block text-xs text-success">{photoName} ready</span>}
            </label>
            {form.image && (
              <div
                className="aspect-[4/3] w-full rounded-md border border-border bg-cover bg-center sm:max-w-xs"
                style={{ backgroundImage: `url(${form.image})` }}
                role="img"
                aria-label="Product photo preview"
              />
            )}
            <button type="submit" className="w-full rounded-sm bg-gradient-brand px-8 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white sm:w-auto">Add product</button>
            {added && <p className="text-xs text-success">Added — refresh to see it in the store.</p>}
          </form>
        )}
      </div>
    </div>
  );
}

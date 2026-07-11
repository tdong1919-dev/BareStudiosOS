import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = { title: "Forms & SOAPs - Bare Studios OS" };

const inputClass = "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

const templates = [
  ["Lash extension consent", "Lashes", "Before first full set"],
  ["Facial intake + contraindications", "Facials", "Before first facial"],
  ["Waxing consent", "Waxing", "Before waxing service"],
  ["SOAP treatment note", "All services", "After appointment"],
];

export default async function FormsPage() {
  const session = await requireSession();
  const rows = (await readSheetTab("FormsSOAPs")).filter((r) => (r.Salon || "").toLowerCase() === session.salon.toLowerCase());
  const unsigned = rows.filter((r) => (r.Status || "Unsigned").toLowerCase() !== "signed");

  return (
    <PageShell eyebrow="Forms" title="Forms & SOAPs." intro="Assign intake forms, consent forms, and SOAP notes by service so client records stay complete before and after appointments." wide>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">{rows.length}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">all forms/SOAPs</p></div>
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">{unsigned.length}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">unsigned</p></div>
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">4</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">templates</p></div>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl">Create / assign form</h2>
        <form action="/api/forms" method="POST" className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className={inputClass} name="client" placeholder="Client name" aria-label="Client" />
          <input className={inputClass} name="service" placeholder="Service" aria-label="Service" />
          <select className={inputClass} name="type" aria-label="Form type" defaultValue="Intake">
            <option>Intake</option><option>Consent</option><option>SOAP</option><option>Treatment note</option><option>Aftercare</option>
          </select>
          <select className={inputClass} name="status" aria-label="Status" defaultValue="Unsigned">
            <option>Unsigned</option><option>Sent</option><option>Signed</option><option>Needs review</option>
          </select>
          <textarea className={`${inputClass} min-h-24 sm:col-span-2`} name="notes" placeholder="Form fields, SOAP notes, contraindications, aftercare, or internal notes" aria-label="Notes" />
          <button className="rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white sm:col-span-2">Save form / SOAP</button>
        </form>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Templates by service</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {templates.map(([name, service, timing], i) => (
              <div key={name} className={`bg-white p-4 text-sm ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="font-medium">{name}</p><p className="mt-1 text-text-secondary">{service} · {timing}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Recent forms</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {(rows.length ? rows : [
              { Client: "Jasmine Rivera", Type: "SOAP", Service: "Classic lash fill", Status: "Needs review" },
              { Client: "Sandra Miller", Type: "Intake", Service: "Custom facial", Status: "Unsigned" },
            ]).slice(0, 8).map((row, i) => (
              <div key={`${row.Client}-${i}`} className={`grid gap-2 bg-white p-4 text-sm sm:grid-cols-4 ${i > 0 ? "border-t border-border" : ""}`}>
                <strong>{row.Client || "Client"}</strong><span>{row.Type || "Form"}</span><span>{row.Service || "Service"}</span><span>{row.Status || "Unsigned"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

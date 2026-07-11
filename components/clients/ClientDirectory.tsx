"use client";

import { useMemo, useState } from "react";

type ClientRow = Record<string, string>;

const reminderRules = [
  { match: ["lash", "fill", "extension"], text: "Recommend lash cleanser today and pre-book the next fill before they leave." },
  { match: ["facial", "skin", "dermaplaning", "peel"], text: "Check skin goals, recommend SPF or serum, and schedule the next facial window." },
  { match: ["barber", "hair", "cut"], text: "Ask about product needs and offer the next maintenance cut before checkout." },
  { match: ["brow", "wax", "lamination"], text: "Confirm preferred shape notes and suggest a 4-6 week touch-up." },
];

function reminderFor(service: string) {
  const normalized = service.toLowerCase();
  return reminderRules.find((rule) => rule.match.some((word) => normalized.includes(word)))?.text || "Review service history and recommend the next best booking before checkout.";
}

function money(row: ClientRow) {
  return row.Spent || row["Total Spent"] || row["Lifetime Spend"] || "$0";
}

function normalized(row: ClientRow) {
  return [
    row.Name,
    row.Email,
    row.Phone,
    row.Service,
    row["Last visit"],
    row.Salon,
  ].join(" ").toLowerCase();
}

function dueToRebook(row: ClientRow) {
  const lastVisit = row["Last visit"];
  const interval = Number(row["Interval days"] || 0);
  if (!lastVisit || !interval) return false;
  const last = new Date(lastVisit);
  if (Number.isNaN(last.getTime())) return false;
  const dueAt = new Date(last);
  dueAt.setDate(dueAt.getDate() + interval);
  return dueAt <= new Date();
}

export default function ClientDirectory({ rows }: { rows: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [visibleCount, setVisibleCount] = useState(60);

  const services = useMemo(() => {
    const values = rows.map((row) => row.Service || "No service imported").filter(Boolean);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !q || normalized(row).includes(q);
      const matchesService = service === "all" || (row.Service || "No service imported") === service;
      const matchesStatus =
        status === "all" ||
        (status === "due" && dueToRebook(row)) ||
        (status === "sms" && (row.SMS || "on") !== "off") ||
        (status === "email" && (row.EmailOptIn || "on") !== "off") ||
        (status === "missing-contact" && !row.Email && !row.Phone);
      return matchesQuery && matchesService && matchesStatus;
    });
  }, [query, rows, service, status]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium">Client list</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Showing {visible.length} of {filtered.length} matched clients. {rows.length} total in the database.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[720px]">
          <input
            className="rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-text-primary"
            placeholder="Search name, phone, email, service"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(60);
            }}
          />
          <select
            className="rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-text-primary"
            value={service}
            onChange={(event) => {
              setService(event.target.value);
              setVisibleCount(60);
            }}
          >
            <option value="all">All services</option>
            {services.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select
            className="rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-text-primary"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setVisibleCount(60);
            }}
          >
            <option value="all">All clients</option>
            <option value="due">Due to rebook</option>
            <option value="sms">SMS opted in</option>
            <option value="email">Email opted in</option>
            <option value="missing-contact">Missing contact</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {visible.map((client, index) => (
          <article key={`${client.Name}-${client.Email}-${client.Phone}-${index}`} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-2xl font-medium">{client.Name || "Client"}</p>
                <p className="mt-1 text-sm text-text-secondary">{client.Phone || "No phone"} · {client.Email || "No email"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] ${dueToRebook(client) ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                {dueToRebook(client) ? "rebook" : "active"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Spent</p><p className="font-medium">{money(client)}</p></div>
              <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Last visit</p><p className="font-medium">{client["Last visit"] || "Not imported"}</p></div>
              <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Last service</p><p className="font-medium">{client.Service || "Not imported"}</p></div>
              <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Card on file</p><p className="font-medium">Stripe setup</p></div>
            </div>

            <div className="mt-5 grid gap-2 text-sm">
              <label className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">SMS notifications <input type="checkbox" defaultChecked={(client.SMS || "on") !== "off"} /></label>
              <label className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">Email notifications <input type="checkbox" defaultChecked={(client.EmailOptIn || "on") !== "off"} /></label>
            </div>

            <div className="mt-5 rounded-md border border-border bg-surface-elevated p-4 text-sm leading-relaxed text-text-secondary">
              <p className="font-medium text-text-primary">Reminder</p>
              <p className="mt-1">{reminderFor(client.Service || "")}</p>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
          No clients match those filters.
        </div>
      )}

      {visible.length < filtered.length && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 60)}
            className="rounded-sm border border-border bg-surface-elevated px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-linen"
          >
            Show 60 more
          </button>
        </div>
      )}
    </section>
  );
}

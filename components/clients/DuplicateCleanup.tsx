"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clientEmailKey, clientNameKey, clientPhoneKey, clientRowKey, type ClientRecord } from "@/lib/client-records";

type MergePlan = {
  id: string;
  reason: "Same email" | "Same phone";
  master: ClientRecord;
  duplicates: ClientRecord[];
};

function uniqueRows(rows: ClientRecord[]) {
  return Array.from(new Map(rows.map((row) => [clientRowKey(row), row])).values());
}

function bestMaster(rows: ClientRecord[]) {
  return rows
    .map((row) => ({
      row,
      score: (row.Name ? 2 : 0) + (row.Email ? 2 : 0) + (row.Phone ? 2 : 0) + (row.Service ? 1 : 0) + (row["Last visit"] ? 1 : 0) + (row.Source !== "batch-import" ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.row || rows[0];
}

function exactPlans(rows: ClientRecord[]) {
  const plans: MergePlan[] = [];
  const consumed = new Set<string>();
  const sources = [
    ["Same email", clientEmailKey],
    ["Same phone", clientPhoneKey],
  ] as const;

  sources.forEach(([reason, getKey]) => {
    const map = new Map<string, ClientRecord[]>();
    rows.forEach((row) => {
      if (consumed.has(clientRowKey(row))) return;
      const key = getKey(row);
      if (key) map.set(key, [...(map.get(key) || []), row]);
    });

    map.forEach((items, key) => {
      const unique = uniqueRows(items);
      if (unique.length < 2) return;
      const master = bestMaster(unique);
      const masterKey = clientRowKey(master);
      const duplicates = unique.filter((row) => clientRowKey(row) !== masterKey);
      duplicates.forEach((row) => consumed.add(clientRowKey(row)));
      plans.push({ id: `${reason}-${key}`, reason, master, duplicates });
    });
  });

  return plans;
}

function fuzzyGroups(rows: ClientRecord[], exactDuplicateKeys: Set<string>) {
  const map = new Map<string, ClientRecord[]>();
  rows.forEach((row) => {
    if (exactDuplicateKeys.has(clientRowKey(row))) return;
    const key = clientNameKey(row);
    if (key) map.set(key, [...(map.get(key) || []), row]);
  });
  return Array.from(map.entries())
    .map(([key, items]) => ({ id: key, rows: uniqueRows(items) }))
    .filter((group) => group.rows.length > 1);
}

export default function DuplicateCleanup({ rows, mergedCount }: { rows: ClientRecord[]; mergedCount: number }) {
  const router = useRouter();
  const plans = useMemo(() => exactPlans(rows), [rows]);
  const duplicateKeys = useMemo(() => new Set(plans.flatMap((plan) => plan.duplicates.map(clientRowKey))), [plans]);
  const fuzzy = useMemo(() => fuzzyGroups(rows, duplicateKeys), [duplicateKeys, rows]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const exactDuplicateCount = plans.reduce((count, plan) => count + plan.duplicates.length, 0);
  const emailGroups = plans.filter((plan) => plan.reason === "Same email").length;
  const phoneGroups = plans.filter((plan) => plan.reason === "Same phone").length;

  async function mergeAllExact() {
    if (plans.length === 0) {
      setMessage("No exact email or phone duplicates to merge.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/client/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merges: plans.map((plan) => ({
            masterKey: clientRowKey(plan.master),
            masterName: plan.master.Name || plan.master.Email || plan.master.Phone || "Client",
            duplicateKeys: plan.duplicates.map(clientRowKey),
            duplicateNames: plan.duplicates.map((row) => row.Name || row.Email || row.Phone || "Client"),
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || "Could not merge duplicates.");
        return;
      }
      setMessage(`Merged ${json.merged || exactDuplicateCount} duplicate client record${(json.merged || exactDuplicateCount) === 1 ? "" : "s"}.`);
      router.refresh();
    } catch {
      setMessage("Could not merge duplicates.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium">Duplicate cleanup</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Exact email and phone matches can be merged all at once. Original rows stay in Google Sheets; duplicate cards are hidden from Customers.
          </p>
        </div>
        <div className="rounded-md border border-border bg-white px-4 py-3 text-sm">
          <strong>{exactDuplicateCount}</strong> exact duplicate row{exactDuplicateCount === 1 ? "" : "s"} · <strong>{mergedCount}</strong> already hidden
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-4"><p className="font-serif text-3xl">{emailGroups}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">email groups</p></div>
        <div className="rounded-lg border border-border bg-white p-4"><p className="font-serif text-3xl">{phoneGroups}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">phone groups</p></div>
        <div className="rounded-lg border border-border bg-white p-4"><p className="font-serif text-3xl">{fuzzy.length}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">name-only matches</p></div>
        <div className="rounded-lg border border-border bg-white p-4"><p className="font-serif text-3xl">{exactDuplicateCount}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">will be hidden</p></div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={mergeAllExact} disabled={busy || exactDuplicateCount === 0} className="rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
          {busy ? "Merging..." : "Merge all exact duplicates"}
        </button>
        <p className="text-sm text-text-secondary">
          {message || (fuzzy.length > 0 ? `${fuzzy.length} name-only group${fuzzy.length === 1 ? "" : "s"} need manual review later.` : "No name-only review needed.")}
        </p>
      </div>

      {plans.length > 0 && (
        <details className="mt-5 rounded-md border border-border bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium">Preview what will merge</summary>
          <div className="mt-3 max-h-72 overflow-auto divide-y divide-border text-sm">
            {plans.slice(0, 50).map((plan) => (
              <div key={plan.id} className="py-3">
                <p className="font-medium">Keep: {plan.master.Name || plan.master.Email || plan.master.Phone || "Client"}</p>
                <p className="text-text-secondary">Hide {plan.duplicates.length}: {plan.duplicates.slice(0, 5).map((row) => row.Name || row.Email || row.Phone || "Client").join(", ")}{plan.duplicates.length > 5 ? "..." : ""}</p>
              </div>
            ))}
            {plans.length > 50 && <p className="py-3 text-text-secondary">Showing first 50 of {plans.length} merge groups.</p>}
          </div>
        </details>
      )}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clientEmailKey, clientNameKey, clientPhoneKey, clientRowKey, type ClientRecord } from "@/lib/client-records";

type DuplicateGroup = { id: string; reason: string; rows: ClientRecord[] };

function findGroups(rows: ClientRecord[]) {
  const sources = [
    ["Same email", clientEmailKey],
    ["Same phone", clientPhoneKey],
    ["Similar name", clientNameKey],
  ] as const;
  const signatures = new Set<string>();
  const groups: DuplicateGroup[] = [];
  sources.forEach(([reason, getKey]) => {
    const map = new Map<string, ClientRecord[]>();
    rows.forEach((row) => {
      const key = getKey(row);
      if (key) map.set(key, [...(map.get(key) || []), row]);
    });
    map.forEach((items, key) => {
      const unique = Array.from(new Map(items.map((row) => [clientRowKey(row), row])).values());
      if (unique.length < 2) return;
      const signature = unique.map(clientRowKey).sort().join("|");
      if (signatures.has(signature)) return;
      signatures.add(signature);
      groups.push({ id: `${reason}-${key}`, reason, rows: unique });
    });
  });
  return groups;
}

function bestMaster(rows: ClientRecord[]) {
  return rows
    .map((row) => ({
      row,
      score: (row.Name ? 2 : 0) + (row.Email ? 2 : 0) + (row.Phone ? 2 : 0) + (row.Service ? 1 : 0) + (row["Last visit"] ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.row || rows[0];
}

export default function DuplicateCleanup({ rows, mergedCount }: { rows: ClientRecord[]; mergedCount: number }) {
  const router = useRouter();
  const groups = useMemo(() => findGroups(rows), [rows]);
  const [groupId, setGroupId] = useState(groups[0]?.id || "");
  const group = groups.find((item) => item.id === groupId) || groups[0];
  const defaultMaster = group ? clientRowKey(bestMaster(group.rows)) : "";
  const [masterKey, setMasterKey] = useState(defaultMaster);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(group?.rows.map(clientRowKey).filter((key) => key !== defaultMaster) || []));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function selectGroup(id: string) {
    const next = groups.find((item) => item.id === id);
    setGroupId(id);
    setMessage("");
    if (!next) return;
    const master = clientRowKey(bestMaster(next.rows));
    setMasterKey(master);
    setSelected(new Set(next.rows.map(clientRowKey).filter((key) => key !== master)));
  }

  function selectMaster(key: string) {
    setMasterKey(key);
    setSelected(new Set(group?.rows.map(clientRowKey).filter((rowKey) => rowKey !== key) || []));
  }

  async function mergeSelected() {
    if (!group) return;
    const duplicateKeys = Array.from(selected).filter((key) => key !== masterKey);
    if (!masterKey || duplicateKeys.length === 0) {
      setMessage("Choose a master client and at least one duplicate.");
      return;
    }
    const master = group.rows.find((row) => clientRowKey(row) === masterKey);
    const duplicates = group.rows.filter((row) => duplicateKeys.includes(clientRowKey(row)));
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/client/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterKey,
          masterName: master?.Name || master?.Email || "Client",
          duplicateKeys,
          duplicateNames: duplicates.map((row) => row.Name || row.Email || row.Phone || "Client"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || "Couldn't save that merge.");
        return;
      }
      setMessage(`Merged ${duplicateKeys.length} duplicate${duplicateKeys.length === 1 ? "" : "s"}.`);
      router.refresh();
    } catch {
      setMessage("Couldn't save that merge.");
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
            Review likely duplicates by matching email, phone, or similar name. Merging hides selected duplicate cards but keeps original rows in Google Sheets.
          </p>
        </div>
        <div className="rounded-md border border-border bg-white px-4 py-3 text-sm">
          <strong>{groups.length}</strong> possible group{groups.length === 1 ? "" : "s"} · <strong>{mergedCount}</strong> hidden merged row{mergedCount === 1 ? "" : "s"}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-5 rounded-md border border-border bg-white p-4 text-sm text-text-secondary">No likely duplicates found right now.</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {groups.map((item) => (
              <button key={item.id} type="button" onClick={() => selectGroup(item.id)} className={`w-full rounded-md border px-4 py-3 text-left text-sm ${item.id === group?.id ? "border-text-primary bg-white" : "border-border bg-surface-elevated"}`}>
                <span className="block font-medium">{item.reason}</span>
                <span className="text-text-secondary">{item.rows.length} matching records</span>
              </button>
            ))}
          </div>

          {group && (
            <div>
              <div className="grid gap-3 xl:grid-cols-2">
                {group.rows.map((row) => {
                  const key = clientRowKey(row);
                  const isMaster = key === masterKey;
                  return (
                    <article key={key} className={`rounded-lg border bg-white p-4 ${isMaster ? "border-success" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-xl font-medium">{row.Name || "Client"}</p>
                          <p className="mt-1 text-sm text-text-secondary">{row.Phone || "No phone"} · {row.Email || "No email"}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] ${isMaster ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{isMaster ? "master" : "duplicate"}</span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <p><span className="text-text-muted">Service:</span> {row.Service || "Not imported"}</p>
                        <p><span className="text-text-muted">Last visit:</span> {row["Last visit"] || "Not imported"}</p>
                        <p><span className="text-text-muted">Source:</span> {row.Source || "Unknown"}</p>
                        <p><span className="text-text-muted">Added:</span> {row.Added || "Unknown"}</p>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name={`master-${group.id}`} checked={isMaster} onChange={() => selectMaster(key)} /> Keep this as master profile</label>
                        {!isMaster && (
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={selected.has(key)} onChange={() => setSelected((current) => {
                              const next = new Set(current);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            })} />
                            Hide this duplicate after merge
                          </label>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={mergeSelected} disabled={busy} className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
                  {busy ? "Saving..." : "Merge selected duplicates"}
                </button>
                {message && <p className="text-sm text-text-secondary">{message}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

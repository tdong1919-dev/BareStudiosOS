"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ParsedClient = {
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  service: string;
  intervalDays: string;
};

const defaultButtonClass =
  "rounded-sm border border-border bg-surface-elevated px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-linen";
const IMPORT_BATCH_SIZE = 75;
const DB_NAME = "bare-studios-imports";
const DB_VERSION = 1;
const ROW_STORE = "clientRows";
const META_STORE = "importMeta";
const ACTIVE_IMPORT_KEY = "active";

type ImportMeta = {
  id: string;
  fileName: string;
  total: number;
  nextIndex: number;
  imported: number;
  skipped: number;
  createdAt: string;
};

type StoredClient = ParsedClient & {
  index: number;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

function keyFor(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: Record<string, string>, keys: string[]) {
  return keys.map((key) => row[key]).find(Boolean) || "";
}

function findHeaderIndex(rows: string[][]) {
  let bestIndex = -1;
  let bestScore = 0;
  const knownHeaders = new Set([
    "name",
    "clientname",
    "customername",
    "fullname",
    "firstname",
    "lastname",
    "email",
    "emailaddress",
    "phone",
    "phonenumber",
    "mobile",
    "cell",
    "lastvisit",
    "lastvisited",
    "lastappointment",
    "service",
  ]);

  rows.slice(0, 30).forEach((row, index) => {
    const score = row.map(keyFor).filter((cell) => knownHeaders.has(cell)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 2 ? bestIndex : 0;
}

function mapRows(rows: string[][]): ParsedClient[] {
  if (rows.length < 2) return [];
  const headerIndex = findHeaderIndex(rows);
  const headers = rows[headerIndex].map(keyFor);

  return rows.slice(headerIndex + 1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] || "").trim();
    });

    const firstName = pick(row, ["firstname", "first"]);
    const lastName = pick(row, ["lastname", "last"]);
    const name = pick(row, ["name", "clientname", "customername", "fullname"]) || [firstName, lastName].filter(Boolean).join(" ");

    return {
      name,
      email: pick(row, ["email", "emailaddress", "clientemail", "customeremail"]),
      phone: pick(row, ["phone", "phonenumber", "mobile", "cell", "cellphone", "clientphone", "customerphone"]),
      lastVisit: pick(row, ["lastvisit", "lastvisited", "lastappointment", "lastappointmentdate", "lastservicedate"]),
      service: pick(row, ["service", "lastservice", "serviceprovider", "appointmenttype"]),
      intervalDays: pick(row, ["intervaldays", "rebookeverydays", "rebookdays", "rebookinginterval"]),
    };
  }).filter((row) => row.name || row.email || row.phone);
}

async function readSpreadsheetRows(file: File) {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1, raw: false, defval: "" });
  }

  return parseCsv(await file.text());
}

function openImportDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ROW_STORE)) db.createObjectStore(ROW_STORE, { keyPath: "index" });
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveImportQueue(clients: ParsedClient[], fileName: string): Promise<ImportMeta> {
  const db = await openImportDb();
  const meta: ImportMeta = {
    id: ACTIVE_IMPORT_KEY,
    fileName,
    total: clients.length,
    nextIndex: 0,
    imported: 0,
    skipped: 0,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([ROW_STORE, META_STORE], "readwrite");
    const rows = tx.objectStore(ROW_STORE);
    const metas = tx.objectStore(META_STORE);
    rows.clear();
    metas.clear();
    metas.put(meta);
    clients.forEach((client, index) => rows.put({ ...client, index }));
    tx.oncomplete = () => {
      db.close();
      resolve(meta);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getImportMeta(): Promise<ImportMeta | null> {
  const db = await openImportDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const request = tx.objectStore(META_STORE).get(ACTIVE_IMPORT_KEY);
    request.onsuccess = () => {
      db.close();
      resolve((request.result as ImportMeta | undefined) || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function setImportMeta(meta: ImportMeta) {
  const db = await openImportDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put(meta);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getImportBatch(startIndex: number, batchSize: number): Promise<ParsedClient[]> {
  const db = await openImportDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ROW_STORE, "readonly");
    const range = IDBKeyRange.bound(startIndex, startIndex + batchSize - 1);
    const request = tx.objectStore(ROW_STORE).openCursor(range);
    const rows: ParsedClient[] = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      const stored = cursor.value as StoredClient;
      const client: ParsedClient = {
        name: stored.name,
        email: stored.email,
        phone: stored.phone,
        lastVisit: stored.lastVisit,
        service: stored.service,
        intervalDays: stored.intervalDays,
      };
      rows.push(client);
      cursor.continue();
    };
    tx.oncomplete = () => {
      db.close();
      resolve(rows);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function clearImportQueue() {
  const db = await openImportDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([ROW_STORE, META_STORE], "readwrite");
    tx.objectStore(ROW_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ClientCsvImporter({
  className = defaultButtonClass,
  label = "Batch Import CSV/XLSX",
}: {
  className?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedImport, setSavedImport] = useState<ImportMeta | null>(null);

  useEffect(() => {
    void getImportMeta().then(setSavedImport).catch(() => setSavedImport(null));
  }, []);

  async function processQueue(startingMeta?: ImportMeta) {
    setBusy(true);
    setError("");

    try {
      let meta = startingMeta || (await getImportMeta());
      if (!meta) {
        setStatus("");
        setError("No staged import was found. Choose the file again.");
        return;
      }

      while (meta.nextIndex < meta.total) {
        const batch = await getImportBatch(meta.nextIndex, IMPORT_BATCH_SIZE);
        if (batch.length === 0) break;

        const nextCount = Math.min(meta.nextIndex + batch.length, meta.total);
        const largeImportNote = meta.total > 250 ? " You can leave this page open; if it pauses, resume later." : "";
        setStatus(`Importing ${nextCount} of ${meta.total} clients from ${meta.fileName}...${largeImportNote}`);

        const res = await fetch("/api/client/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batch }),
        });
        const responseText = await res.text();
        let json: Record<string, string | number | boolean | undefined> = {};
        try {
          json = responseText ? JSON.parse(responseText) : {};
        } catch {
          json = {};
        }

        if (!res.ok) {
          setSavedImport(meta);
          setError(String(json.error || responseText || `Import paused. Server returned ${res.status}.`));
          return;
        }

        meta = {
          ...meta,
          nextIndex: nextCount,
          imported: meta.imported + Number(json.imported || 0),
          skipped: meta.skipped + Number(json.skipped || 0),
        };
        await setImportMeta(meta);
        setSavedImport(meta);

        if (json.error) {
          setError(String(json.error));
          return;
        }

        await wait(250);
      }

      await clearImportQueue();
      setSavedImport(null);
      setStatus(`Imported ${meta.imported} client${meta.imported === 1 ? "" : "s"}.${meta.skipped ? ` Skipped ${meta.skipped}.` : ""}`);
      router.refresh();
    } catch {
      const meta = await getImportMeta().catch(() => null);
      setSavedImport(meta);
      setError("Import paused. Your staged file is still saved here, so click Resume import to keep going.");
    } finally {
      setBusy(false);
    }
  }

  async function importFile(file: File) {
    setBusy(true);
    setError("");
    setStatus(`Reading ${file.name}...`);

    try {
      const clients = mapRows(await readSpreadsheetRows(file));
      if (clients.length === 0) {
        setStatus("");
        setError("No clients were found. Make sure the file has columns like First Name, Last Name, Email, Mobile, Phone, Last Visited, or Service.");
        return;
      }

      setStatus(`Staging ${clients.length} clients from ${file.name}...`);
      const meta = await saveImportQueue(clients, file.name);
      setSavedImport(meta);
      await processQueue(meta);
    } catch {
      setStatus("");
      setError("Something went wrong while reading that file. Try exporting it again as CSV or XLSX.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
      <label className={`inline-flex cursor-pointer justify-center ${className} ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Importing..." : label}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="sr-only"
          aria-label={label}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
          }}
        />
      </label>
      {savedImport && !busy && (
        <>
          <button type="button" onClick={() => void processQueue(savedImport)} className={className}>
            Resume import
          </button>
          <button
            type="button"
            onClick={() => {
              void clearImportQueue().then(() => {
                setSavedImport(null);
                setStatus("");
                setError("");
              });
            }}
            className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-text-secondary"
          >
            Clear import
          </button>
        </>
      )}
      </div>
      {savedImport && !busy && (
        <p className="max-w-md text-xs text-text-muted">
          Staged import: {savedImport.nextIndex} of {savedImport.total} processed from {savedImport.fileName}.
        </p>
      )}
      {status && <p className="max-w-xs text-xs text-success">{status}</p>}
      {error && <p className="max-w-xs text-xs text-error">{error}</p>}
    </div>
  );
}

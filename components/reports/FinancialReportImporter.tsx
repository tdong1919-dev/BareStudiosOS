"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ParsedFinancialRow = {
  reportType: string;
  date: string;
  client: string;
  service: string;
  provider: string;
  grossSales: string;
  discounts: string;
  tips: string;
  tax: string;
  fees: string;
  netSales: string;
  paymentType: string;
  source: string;
  raw: string;
};

type StoredFinancialRow = ParsedFinancialRow & { index: number };

type ImportMeta = {
  id: string;
  fileName: string;
  reportType: string;
  total: number;
  nextIndex: number;
  imported: number;
  skipped: number;
  createdAt: string;
};

const IMPORT_BATCH_SIZE = 75;
const DB_NAME = "bare-studios-financial-imports";
const DB_VERSION = 1;
const ROW_STORE = "financialRows";
const META_STORE = "financialImportMeta";
const ACTIVE_IMPORT_KEY = "active";

const buttonClass =
  "rounded-sm border border-border bg-surface-elevated px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-linen";

const reportTypes = [
  "Transaction list",
  "Sales summary",
  "Deposits",
  "Payment distribution",
  "Product sales",
  "Services/classes",
  "Payroll history",
  "Failed payments",
  "IOU",
  "Gift cards",
  "Packages",
  "Memberships",
  "Combined report",
];

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
    "date",
    "transactiondate",
    "closedate",
    "client",
    "customer",
    "customername",
    "service",
    "item",
    "provider",
    "employee",
    "staff",
    "grosssales",
    "totalsales",
    "sales",
    "amountpaid",
    "total",
    "price",
    "netsales",
    "netamount",
    "net",
    "paid",
    "collected",
    "tips",
    "tax",
    "fees",
    "paymenttype",
    "paymentmethod",
  ]);

  rows.slice(0, 40).forEach((row, index) => {
    const score = row.map(keyFor).filter((cell) => knownHeaders.has(cell)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 2 ? bestIndex : 0;
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

function mapRows(rows: string[][], reportType: string): ParsedFinancialRow[] {
  if (rows.length < 2) return [];
  const headerIndex = findHeaderIndex(rows);
  const originalHeaders = rows[headerIndex].map((header) => String(header || "").trim());
  const headers = originalHeaders.map(keyFor);

  return rows
    .slice(headerIndex + 1)
    .map((cells) => {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = String(cells[index] || "").trim();
      });

      const raw: Record<string, string> = {};
      originalHeaders.forEach((header, index) => {
        if (header) raw[header] = String(cells[index] || "").trim();
      });

      return {
        reportType,
        date: pick(row, ["date", "transactiondate", "closedate", "checkoutdate", "appointmentdate", "paymentdate"]),
        client: pick(row, ["client", "clientname", "customer", "customername", "name"]),
        service: pick(row, ["service", "servicename", "item", "itemname", "description", "product", "class"]),
        provider: pick(row, ["provider", "serviceprovider", "employee", "staff", "teammember", "artist"]),
        grossSales: pick(row, ["grosssales", "gross", "sales", "totalsales", "amount", "amountpaid", "paid", "price", "total", "grandtotal", "subtotal", "servicesales", "productsales", "charge", "paymentamount"]),
        discounts: pick(row, ["discounts", "discount", "promotions", "promo", "coupons", "coupon"]),
        tips: pick(row, ["tips", "tip", "gratuity", "totaltips"]),
        tax: pick(row, ["tax", "taxes", "salestax", "totaltax"]),
        fees: pick(row, ["fees", "processingfee", "creditcardfee", "cardfee", "stripefee", "processorfee"]),
        netSales: pick(row, ["netsales", "net", "netamount", "netrevenue", "payout", "deposit", "collected", "totalcollected", "paid", "amountpaid", "payments", "paymentamount"]),
        paymentType: pick(row, ["paymenttype", "paymentmethod", "tender", "cardtype", "source"]),
        source: "financial-import",
        raw: JSON.stringify(raw),
      };
    })
    .filter((row) => row.date || row.client || row.service || row.provider || row.grossSales || row.netSales);
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

async function saveImportQueue(rows: ParsedFinancialRow[], fileName: string, reportType: string): Promise<ImportMeta> {
  const db = await openImportDb();
  const meta: ImportMeta = {
    id: ACTIVE_IMPORT_KEY,
    fileName,
    reportType,
    total: rows.length,
    nextIndex: 0,
    imported: 0,
    skipped: 0,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([ROW_STORE, META_STORE], "readwrite");
    tx.objectStore(ROW_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.objectStore(META_STORE).put(meta);
    rows.forEach((row, index) => tx.objectStore(ROW_STORE).put({ ...row, index }));
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

async function getImportBatch(startIndex: number, batchSize: number): Promise<ParsedFinancialRow[]> {
  const db = await openImportDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ROW_STORE, "readonly");
    const range = IDBKeyRange.bound(startIndex, startIndex + batchSize - 1);
    const request = tx.objectStore(ROW_STORE).openCursor(range);
    const rows: ParsedFinancialRow[] = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      const stored = cursor.value as StoredFinancialRow;
      rows.push({
        reportType: stored.reportType,
        date: stored.date,
        client: stored.client,
        service: stored.service,
        provider: stored.provider,
        grossSales: stored.grossSales,
        discounts: stored.discounts,
        tips: stored.tips,
        tax: stored.tax,
        fees: stored.fees,
        netSales: stored.netSales,
        paymentType: stored.paymentType,
        source: stored.source,
        raw: stored.raw,
      });
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

export default function FinancialReportImporter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [reportType, setReportType] = useState(reportTypes[0]);
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
        setError("No staged financial import was found. Choose the file again.");
        return;
      }

      while (meta.nextIndex < meta.total) {
        const batch = await getImportBatch(meta.nextIndex, IMPORT_BATCH_SIZE);
        if (batch.length === 0) break;

        const nextCount = Math.min(meta.nextIndex + batch.length, meta.total);
        setStatus(`Importing ${nextCount} of ${meta.total} financial rows from ${meta.fileName}...`);

        const res = await fetch("/api/reports/import", {
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
      setStatus(`Imported ${meta.imported} financial row${meta.imported === 1 ? "" : "s"}.${meta.skipped ? ` Skipped ${meta.skipped}.` : ""}`);
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
      const rows = mapRows(await readSpreadsheetRows(file), reportType);
      if (rows.length === 0) {
        setStatus("");
        setError("No financial rows were found. Make sure the file has headers like Date, Client, Service, Provider, Gross Sales, Net Sales, Payment Type, or Total.");
        return;
      }

      setStatus(`Staging ${rows.length} financial rows from ${file.name}...`);
      const meta = await saveImportQueue(rows, file.name, reportType);
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
    <section className="mb-6 rounded-xl border border-border bg-surface p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[12px] uppercase tracking-[0.22em] text-text-muted">Import history</p>
          <h2 className="mt-2 font-serif text-2xl">Past financial reports.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Upload Vagaro, Stripe, or spreadsheet exports here. Bare Studios OS saves the normalized data into the FinancialReports tab so Reports and the Financial Assistant can use it.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-72">
          <label className="text-xs uppercase tracking-[0.14em] text-text-muted" htmlFor="financial-report-type">
            Report type
          </label>
          <select
            id="financial-report-type"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            className="rounded-sm border border-border bg-white px-4 py-3 text-sm"
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label className={`inline-flex cursor-pointer justify-center ${buttonClass} ${busy ? "pointer-events-none opacity-60" : ""}`}>
            {busy ? "Importing..." : "Import financial CSV/XLSX"}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="sr-only"
              aria-label="Import financial CSV or XLSX"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
              }}
            />
          </label>
          {savedImport && !busy && (
            <>
              <button type="button" onClick={() => void processQueue(savedImport)} className={buttonClass}>
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
        {status && <p className="max-w-xl text-xs text-success">{status}</p>}
        {error && <p className="max-w-xl text-xs text-error">{error}</p>}
      </div>
    </section>
  );
}

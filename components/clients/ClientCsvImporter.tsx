"use client";

import { useRef, useState } from "react";
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
const IMPORT_BATCH_SIZE = 5;

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

      let imported = 0;
      let skipped = 0;
      const largeImportNote = clients.length > 250 ? " This large Vagaro file may take a few minutes." : "";

      for (let index = 0; index < clients.length; index += IMPORT_BATCH_SIZE) {
        const batch = clients.slice(index, index + IMPORT_BATCH_SIZE);
        setStatus(`Importing ${Math.min(index + batch.length, clients.length)} of ${clients.length} clients...${largeImportNote}`);

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
          setStatus(imported ? `Imported ${imported} before the import stopped.` : "");
          setError(String(json.error || responseText || `The file could not be imported. Server returned ${res.status}.`));
          return;
        }

        imported += Number(json.imported || 0);
        skipped += Number(json.skipped || 0);

        if (json.error) {
          setStatus(`Imported ${imported} before the import stopped.`);
          setError(String(json.error));
          return;
        }
      }

      setStatus(`Imported ${imported} client${imported === 1 ? "" : "s"}.${skipped ? ` Skipped ${skipped}.` : ""}`);
      router.refresh();
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
      {status && <p className="max-w-xs text-xs text-success">{status}</p>}
      {error && <p className="max-w-xs text-xs text-error">{error}</p>}
    </div>
  );
}

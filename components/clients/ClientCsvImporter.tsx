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

function mapRows(rows: string[][]): ParsedClient[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(keyFor);

  return rows.slice(1).map((cells) => {
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

export default function ClientCsvImporter({
  className = defaultButtonClass,
  label = "Batch Import CSV",
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
      const clients = mapRows(parseCsv(await file.text()));
      if (clients.length === 0) {
        setStatus("");
        setError("No clients were found. Make sure the CSV has headers like Name, Email, Phone, Last Visit, or Service.");
        return;
      }

      setStatus(`Importing ${clients.length} client${clients.length === 1 ? "" : "s"}...`);
      const res = await fetch("/api/client/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: clients }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("");
        setError(json.error || "The CSV could not be imported.");
        return;
      }

      setStatus(`Imported ${json.imported || 0} client${json.imported === 1 ? "" : "s"}.${json.skipped ? ` Skipped ${json.skipped}.` : ""}`);
      router.refresh();
    } catch {
      setStatus("");
      setError("Something went wrong while reading that CSV. Try exporting it again as a standard CSV file.");
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
          accept=".csv,text/csv"
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

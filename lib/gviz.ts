/**
 * Read a tab from the salon's Google Sheet as rows of objects, using Google's
 * gviz CSV export endpoint. This is a reliable read path (unlike the Apps
 * Script web-app response, whose content echo is flaky on Workspace accounts).
 *
 * Requires SHEETS_SHEET_ID and the sheet shared so "anyone with the link can
 * view". If unset or the fetch fails, returns []. The first row is treated as
 * headers; each subsequent row becomes an object keyed by header.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export async function readSheetTab(tab: string): Promise<Record<string, string>[]> {
  const id = process.env.SHEETS_SHEET_ID;
  if (!id) return [];
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  try {
    const res = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!res.ok) return [];
    const csv = await res.text();
    // A non-viewable sheet returns an HTML login page, not CSV.
    if (csv.trimStart().startsWith("<")) return [];
    const rows = parseCsv(csv);
    if (rows.length < 2) return [];
    const headers = rows[0].map((h) => h.trim());
    return rows.slice(1).map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] ?? "").trim();
      });
      return obj;
    });
  } catch {
    return [];
  }
}

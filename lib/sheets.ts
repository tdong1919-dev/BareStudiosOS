const DEFAULT_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxYjelNMORd6t8AUeAqy-j5xb97Gf2Mza0CTvl5-_JG_n0I7_kHlitqhsCxOn5VzxvR6Q/exec";

export function getSheetsWebhookUrl() {
  return process.env.SHEETS_WEBHOOK_URL || DEFAULT_SHEETS_WEBHOOK_URL;
}

/**
 * Append a row to a named tab in the salon's Google Sheet via the Apps Script
 * webhook. We don't follow the Apps Script 302 (its content echo is flaky on
 * Workspace accounts and we don't need the body) — the redirect confirms the
 * doPost ran and the row was written.
 */
export async function appendSheetRow(
  tab: string,
  headers: string[],
  row: (string | number)[],
): Promise<{ ok: boolean; error?: string }> {
  return appendToSheets({ tab, headers, row });
}

export async function appendSheetRows(
  tab: string,
  headers: string[],
  rows: (string | number)[][],
): Promise<{ ok: boolean; error?: string; appended?: number }> {
  return appendToSheets({ tab, headers, rows });
}

async function appendToSheets(payload: {
  tab: string;
  headers: string[];
  row?: (string | number)[];
  rows?: (string | number)[][];
}): Promise<{ ok: boolean; error?: string; appended?: number }> {
  const url = getSheetsWebhookUrl();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: process.env.SHEETS_WEBHOOK_SECRET }),
      redirect: "follow",
    });
    const text = await res.text();
    let json: { ok?: boolean; error?: string; appended?: number } = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }

    const ok = res.status >= 200 && res.status < 400 && json.ok !== false;
    if (ok) return { ok: true, appended: json.appended };

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        error:
          "Google Apps Script denied access. In Apps Script, deploy the Web App with 'Who has access: Anyone'.",
      };
    }

    return {
      ok: false,
      error: json.error || text || `Google Sheets webhook returned ${res.status}`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "sheet error" };
  }
}

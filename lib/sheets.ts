const DEFAULT_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwSz3AS74vdNWRuskIPyCGC39ZZY4al1W4jDvM45vzMv428T2-9Dzxk9xbr1kcRdon4fg/exec";

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
  const url = getSheetsWebhookUrl();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab, headers, row, secret: process.env.SHEETS_WEBHOOK_SECRET }),
      redirect: "manual",
    });
    const ok = res.status === 0 || (res.status >= 200 && res.status < 400);
    if (ok) return { ok: true };

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        error:
          "Google Apps Script denied access. In Apps Script, deploy the Web App with 'Who has access: Anyone'.",
      };
    }

    return { ok: false, error: `Google Sheets webhook returned ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "sheet error" };
  }
}

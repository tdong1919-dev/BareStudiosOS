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
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return { ok: false, error: "SHEETS_WEBHOOK_URL not set" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab, headers, row, secret: process.env.SHEETS_WEBHOOK_SECRET }),
      redirect: "manual",
    });
    const ok = res.status === 0 || (res.status >= 200 && res.status < 400);
    return ok ? { ok: true } : { ok: false, error: `Sheet ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "sheet error" };
  }
}

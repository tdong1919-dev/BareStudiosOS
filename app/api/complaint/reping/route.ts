/**
 * GET /api/complaint/reping — re-alerts the owner about complaints that are
 * still "open" 24-48h after they were filed. Intended to run on a daily
 * schedule (Netlify Scheduled Function or any cron hitting this URL).
 *
 * Auth: send `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 * Reads the Complaints tab via gviz (needs SHEETS_SHEET_ID + link-view sharing).
 */
import { NextRequest, NextResponse } from "next/server";
import { readSheetTab } from "@/lib/gviz";
import { sendHelpEmail } from "@/lib/notify";

const DAY = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const qs = request.nextUrl.searchParams.get("secret") || "";
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const rows = await readSheetTab("Complaints");
  const now = Date.now();
  const stale = rows.filter((r) => {
    if ((r.Status || "").toLowerCase() !== "open") return false;
    const opened = Date.parse(r.Opened);
    if (Number.isNaN(opened)) return false;
    const age = now - opened;
    return age >= DAY && age < 2 * DAY; // single reminder on day 2
  });

  let pinged = 0;
  for (const r of stale) {
    const res = await sendHelpEmail({
      name: r.Name || "Salon client",
      email: r.Email || "no-reply@unknown.invalid",
      phone: r.Phone || null,
      page_name: r.Salon || null,
      concern_type: `Complaint STILL OPEN · ${r.Severity || "unspecified"}`,
      message:
        `Reminder — ticket ${r.Ticket} is still open after 24 hours.\n\n` +
        `${r.Message}\n\n` +
        `Resolve it in the Complaints tab to stop these reminders.`,
    }).catch(() => ({ ok: false as const }));
    if (res.ok) pinged++;
  }

  return NextResponse.json({ ok: true, checked: rows.length, stale: stale.length, pinged });
}

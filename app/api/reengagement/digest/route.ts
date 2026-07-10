/**
 * GET /api/reengagement/digest — emails the owner a daily list of clients who
 * are overdue to rebook (today − last visit ≥ their service interval). Intended
 * for a daily cron. Reads the Clients tab via gviz.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 */
import { NextRequest, NextResponse } from "next/server";
import { readSheetTab } from "@/lib/gviz";
import { sendHelpEmail } from "@/lib/notify";
import { overdueClients } from "@/lib/reengagement";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const qs = request.nextUrl.searchParams.get("secret") || "";
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const rows = await readSheetTab("Clients");
  const due = overdueClients(rows);

  if (due.length === 0) {
    return NextResponse.json({ ok: true, due: 0 });
  }

  const lines = due
    .slice(0, 50)
    .map((c) => `• ${c.name}${c.service ? ` (${c.service})` : ""} — ${c.daysSince}d since last visit, ${c.overdueBy}d overdue${c.phone ? ` · ${c.phone}` : ""}`)
    .join("\n");

  const notify = await sendHelpEmail({
    name: "Re-engagement",
    email: "no-reply@unknown.invalid",
    concern_type: "Clients due to rebook",
    message: `${due.length} client(s) are overdue to rebook:\n\n${lines}\n\nReach out today to fill the calendar.`,
  }).catch(() => ({ ok: false as const }));

  return NextResponse.json({ ok: true, due: due.length, emailed: notify.ok });
}

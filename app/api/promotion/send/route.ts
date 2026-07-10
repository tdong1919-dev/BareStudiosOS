/**
 * GET /api/promotion/send — daily cron. Emails the owner the promotions whose
 * send date is today so they go out (or are reviewed). Each promo notifies once,
 * on its send date. Auth via CRON_SECRET.
 *
 * NOTE: this notifies the owner. Auto-sending to clients needs a verified Resend
 * domain (the shared sender only delivers to the account owner) + a per-audience
 * client list — wire that once a domain is verified.
 */
import { NextRequest, NextResponse } from "next/server";
import { readSheetTab } from "@/lib/gviz";
import { sendHelpEmail } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const qs = request.nextUrl.searchParams.get("secret") || "";
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const rows = await readSheetTab("Promotions");
  const due = rows.filter((r) => (r.Status || "").toLowerCase() === "scheduled" && (r["Send date"] || "").slice(0, 10) === today);

  if (due.length === 0) {
    return NextResponse.json({ ok: true, due: 0 });
  }

  const lines = due
    .map((r) => `• ${r.Salon ? `[${r.Salon}] ` : ""}${r.Name} — ${r.Offer} → ${r.Audience} (${r.Channels || "—"})`)
    .join("\n");

  const notify = await sendHelpEmail({
    name: "Promotions",
    email: "no-reply@unknown.invalid",
    concern_type: "Promotions due today",
    message: `${due.length} promotion(s) are scheduled to send today:\n\n${lines}`,
  }).catch(() => ({ ok: false as const }));

  return NextResponse.json({ ok: true, due: due.length, emailed: notify.ok });
}

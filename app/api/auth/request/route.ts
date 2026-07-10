/**
 * POST /api/auth/request — start passwordless sign-in. Looks up (or creates) the
 * user in the Users tab, then emails a 15-minute magic link. The salon/role are
 * baked into the link token so the callback needs no sheet read.
 */
import { NextRequest, NextResponse } from "next/server";
import { signMagic } from "@/lib/auth";
import { findUser, USER_HEADERS } from "@/lib/users";
import { appendSheetRow } from "@/lib/sheets";
import { sendMagicLink } from "@/lib/notify";
import { appBaseUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Auth isn't configured (AUTH_SECRET)." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const email = (body.email ?? "").trim().toLowerCase();
  const salonInput = (body.salon ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const existing = await findUser(email);
  if (!existing && !salonInput) {
    return NextResponse.json({ error: "New here? Add your salon name to create your account.", needsSalon: true }, { status: 400 });
  }

  const salon = existing?.salon || salonInput;
  const role = existing?.role || "owner";

  if (!existing) {
    await appendSheetRow("Users", USER_HEADERS, [new Date().toISOString(), email, salon, role, "active"]);
  }

  const base = appBaseUrl(request.nextUrl.origin);
  const token = signMagic({ email, salon, role });
  const link = `${base}/api/auth/callback?token=${encodeURIComponent(token)}`;

  const sent = await sendMagicLink(email, link).catch(() => ({ ok: false as const }));
  if (!sent.ok) {
    return NextResponse.json({ error: "Couldn't send the sign-in email. Check Resend is configured." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth";
import { appendCredential, findCredential, normalizeEmail } from "@/lib/account-data";
import { hashPassword } from "@/lib/password-auth";
import { appendSheetRow } from "@/lib/sheets";
import { findUser, USER_HEADERS } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");
  const password = String(body.password ?? "");
  const businessName = String(body.businessName ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Create a password with at least 8 characters." }, { status: 400 });
  }
  if (!businessName) {
    return NextResponse.json({ error: "Enter your business name." }, { status: 400 });
  }

  const existingCredential = await findCredential(email);
  if (existingCredential?.passwordHash) {
    return NextResponse.json({ error: "This email already has a password. Sign in instead." }, { status: 409 });
  }

  const existingUser = await findUser(email);
  const salon = existingUser?.salon || businessName;
  const role = existingUser?.role || "owner";

  if (!existingUser) {
    const userSaved = await appendSheetRow("Users", USER_HEADERS, [new Date().toISOString(), email, salon, role, "active"]);
    if (!userSaved.ok) {
      return NextResponse.json({ error: "Couldn't create the account. Check the account database is connected." }, { status: 502 });
    }
  }

  const credentialSaved = await appendCredential(email, hashPassword(password));
  if (!credentialSaved.ok) {
    return NextResponse.json({ error: "Couldn't save the password. Check the account database is connected." }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signSession({ email, salon, role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth";
import { findCredential, normalizeEmail } from "@/lib/account-data";
import { findUser } from "@/lib/users";
import { verifyPassword } from "@/lib/password-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");
  const password = String(body.password ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  const credential = await findCredential(email);
  if (!credential?.passwordHash) {
    return NextResponse.json({ error: "No password is saved for this email yet. Choose Create account to set your password." }, { status: 401 });
  }
  if (credential.status.toLowerCase() !== "active" || !verifyPassword(password, credential.passwordHash)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const user = await findUser(email);
  if (!user) {
    return NextResponse.json({ error: "Account found, but the salon profile is missing. Create your account again or contact support." }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signSession({ email, salon: user.salon, role: user.role || "owner" }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

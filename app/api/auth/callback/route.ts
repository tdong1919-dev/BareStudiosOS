/**
 * GET /api/auth/callback?token=… — completes magic-link sign-in. Verifies the
 * token and sets the signed session cookie, then redirects to /account.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyMagic, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { appBaseUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const base = appBaseUrl(request.nextUrl.origin);
  const token = request.nextUrl.searchParams.get("token") || "";
  const session = verifyMagic(token);

  if (!session) {
    return NextResponse.redirect(`${base}/login?error=expired`);
  }

  const res = NextResponse.redirect(`${base}/account`);
  res.cookies.set(SESSION_COOKIE, signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

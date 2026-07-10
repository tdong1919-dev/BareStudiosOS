/** POST /api/auth/logout — clear the session cookie. */
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { appBaseUrl } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const base = appBaseUrl(request.nextUrl.origin);
  const res = NextResponse.redirect(`${base}/login`, { status: 303 });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

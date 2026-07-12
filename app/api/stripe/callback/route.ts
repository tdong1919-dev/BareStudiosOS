/**
 * GET /api/stripe/callback — Stripe account-link return. Stores salon → acct_id
 * in the "Stripe" tab after Stripe-hosted onboarding returns. No secret keys are
 * stored — only the connected account id.
 */
import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/stripe";
import { appendSheetRow } from "@/lib/sheets";

const HEADERS = ["Connected", "Salon", "Email", "Account ID", "Status"];

export async function GET(request: NextRequest) {
  const base = appBaseUrl(request.nextUrl.origin);
  const settings = `${base}/settings/stripe`;
  const accountId = (request.nextUrl.searchParams.get("accountId") || "").trim();
  const linkError = request.nextUrl.searchParams.get("error");

  if (linkError || !accountId.startsWith("acct_")) {
    return NextResponse.redirect(`${settings}?status=error`);
  }

  const salon = (request.nextUrl.searchParams.get("salon") || "").trim();
  const email = (request.nextUrl.searchParams.get("email") || "").trim();

  await appendSheetRow("Stripe", HEADERS, [new Date().toISOString(), salon, email, accountId, "onboarding_returned"]);
  return NextResponse.redirect(`${settings}?status=connected&salon=${encodeURIComponent(salon)}`);
}

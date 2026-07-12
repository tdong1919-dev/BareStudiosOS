/**
 * GET /api/stripe/connect
 * Kicks off Stripe Connect onboarding using Stripe's account-link flow. This is
 * the newer flow Stripe recommends when the platform creates the connected
 * account and sends the owner to Stripe-hosted onboarding.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";
import { appendSheetRow } from "@/lib/sheets";
import { getStripe, connectConfigured, appBaseUrl } from "@/lib/stripe";

const HEADERS = ["Connected", "Salon", "Email", "Account ID", "Status"];

type StripeWithV2 = {
  v2?: {
    core?: {
      accounts?: {
        create: (params: Record<string, unknown>) => Promise<{ id: string }>;
        retrieve: (id: string, params?: Record<string, unknown>) => Promise<{ id: string }>;
      };
      accountLinks?: {
        create: (params: Record<string, unknown>) => Promise<{ url: string }>;
      };
    };
  };
};

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  const v2 = stripe as StripeWithV2 | null;
  if (!connectConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe Connect isn't configured. Add STRIPE_SECRET_KEY in Netlify." },
      { status: 503 },
    );
  }

  if (!v2?.v2?.core?.accounts?.create || !v2.v2.core.accountLinks?.create) {
    return NextResponse.json(
      { error: "Stripe Connect V2 is not available in the installed Stripe SDK. Update the stripe package." },
      { status: 503 },
    );
  }

  const session = await getSession();
  const salon = (session?.salon || request.nextUrl.searchParams.get("salon") || "").trim();
  const email = (session?.email || request.nextUrl.searchParams.get("email") || "").trim();
  const base = appBaseUrl(request.nextUrl.origin);

  const rows = await readSheetTab("Stripe");
  const existing = rows
    .slice()
    .reverse()
    .find((row) => (
      (row.Salon || "").trim().toLowerCase() === salon.toLowerCase() &&
      (row["Account ID"] || "").startsWith("acct_")
    ));

  let accountId = existing?.["Account ID"] || "";

  if (!accountId) {
    const account = await v2.v2.core.accounts.create({
      display_name: salon || "Bare Studios",
      contact_email: email || undefined,
      identity: { country: "us" },
      dashboard: "full",
      defaults: {
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
      configuration: {
        customer: {},
        merchant: {
          capabilities: {
            card_payments: {
              requested: true,
            },
          },
        },
      },
    });
    accountId = account.id;
    await appendSheetRow("Stripe", HEADERS, [new Date().toISOString(), salon, email, accountId, "created"]);
  }

  const returnUrl = `${base}/api/stripe/callback?accountId=${encodeURIComponent(accountId)}&salon=${encodeURIComponent(salon)}&email=${encodeURIComponent(email)}`;
  const accountLink = await v2.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "customer"],
        refresh_url: `${base}/settings/stripe?status=refresh`,
        return_url: returnUrl,
      },
    },
  });

  return NextResponse.redirect(accountLink.url);
}

/**
 * Server-side Stripe client for the platform account. The platform holds ONE
 * secret key (env, never the sheet). Salons connect via OAuth and we store only
 * their connected-account id (acct_…) — an identifier, not a secret.
 */
import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function connectConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CONNECT_CLIENT_ID);
}

export function appBaseUrl(fallback: string): string {
  return process.env.NEXT_PUBLIC_APP_URL || fallback;
}

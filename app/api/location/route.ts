import { NextRequest, NextResponse } from "next/server";
import { appendLocation } from "@/lib/account-data";
import { getSession } from "@/lib/auth";
import { appBaseUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const base = appBaseUrl(request.nextUrl.origin);
  if (!session) return NextResponse.redirect(`${base}/login`, { status: 303 });

  const form = await request.formData();
  const location = String(form.get("location") || "").trim();
  if (!location) {
    return NextResponse.redirect(`${base}/settings/team?status=location-error`, { status: 303 });
  }

  const saved = await appendLocation({
    ownerEmail: session.email,
    salon: session.salon,
    location,
    address: String(form.get("address") || "").trim(),
    phone: String(form.get("phone") || "").trim(),
    hours: String(form.get("hours") || "").trim(),
    managerEmail: String(form.get("managerEmail") || "").trim(),
    shareAvailability: String(form.get("shareAvailability") || "off"),
    shareInventory: String(form.get("shareInventory") || "off"),
    notes: String(form.get("notes") || "").trim(),
    billingStatus: String(form.get("billingStatus") || "included"),
  });

  return NextResponse.redirect(`${base}/settings/team?status=${saved.ok ? "location-saved" : "location-error"}`, { status: 303 });
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { appendSheetRow } from "@/lib/sheets";

const HEADERS = ["Created", "Salon", "Client", "Service", "Type", "Status", "Notes"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  const form = await request.formData();
  const saved = await appendSheetRow("FormsSOAPs", HEADERS, [
    new Date().toISOString(),
    session.salon,
    String(form.get("client") || ""),
    String(form.get("service") || ""),
    String(form.get("type") || "Form"),
    String(form.get("status") || "Unsigned"),
    String(form.get("notes") || ""),
  ]);
  return NextResponse.redirect(new URL(`/forms?status=${saved.ok ? "saved" : "error"}`, request.url), { status: 303 });
}

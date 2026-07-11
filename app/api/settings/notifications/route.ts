import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { appendSheetRows } from "@/lib/sheets";

const HEADERS = [
  "Saved",
  "Salon",
  "Audience",
  "Automation",
  "Enabled",
  "Channel",
  "When",
  "Instruction",
];

type NotificationRule = {
  audience?: string;
  automation?: string;
  enabled?: boolean;
  channel?: string;
  timing?: string;
  instruction?: string;
};

export async function POST(request: NextRequest) {
  const session = await requireSession();
  const body = await request.json().catch(() => ({}));
  const rules = Array.isArray(body.rules) ? (body.rules as NotificationRule[]) : [];

  if (rules.length === 0) {
    return NextResponse.json({ error: "Add at least one automation rule." }, { status: 400 });
  }

  const savedAt = new Date().toISOString();
  const rows = rules.map((rule) => [
    savedAt,
    session.salon,
    String(rule.audience || "").trim(),
    String(rule.automation || "").trim(),
    rule.enabled ? "on" : "off",
    String(rule.channel || "").trim(),
    String(rule.timing || "").trim(),
    String(rule.instruction || "").trim(),
  ]);

  const result = await appendSheetRows("NotificationRules", HEADERS, rows);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not save notification rules." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, saved: rows.length });
}

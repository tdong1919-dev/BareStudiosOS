/**
 * POST /api/financial-agent — a Claude-powered financial assistant for salon
 * owners. Runs a server-side tool-use loop: the model converses and decides
 * when to compute payroll/commissions (done deterministically in code, never by
 * the model) and when to persist records to the salon's Google Sheet.
 *
 * Requires a signed-in session; the salon is taken from the session (not the
 * client) so writes are scoped to the right salon.
 *
 * Request:  { messages: [{ role: "user" | "assistant", content: string }] }
 * Response: { reply: string }  (or { error } on failure)
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { appendSheetRow } from "@/lib/sheets";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are the Financial Assistant inside Bare Studios OS — a financial assistant for salon, spa, and medspa owners. You help with commission structures, payroll calculations, and plain-English advice to improve the bottom line.

Rules:
- For ANY payroll or commission arithmetic, call the calculate_payroll tool. Never do the math yourself.
- When the owner sets or changes a staff member's commission rate or hourly wage, call save_staff to record it in their sheet.
- After finalizing a payroll run, save it by calling calculate_payroll with save set to true.
- Ask only for the numbers you actually need. If a value is missing, ask once, concisely.
- Be concise and direct. Lead with the answer in plain language — no jargon, no long preamble.
- When it helps, offer one or two specific, actionable ways to improve margin (pricing, commission mix, retail attach rate, slow-day promotions), grounded in the numbers at hand — not generic tips.
- You work only from figures the owner gives you; you have no live access to their bank or POS.`;

type Entry = {
  name: string;
  serviceRevenue?: number;
  tips?: number;
  hours?: number;
  commissionPct?: number;
  hourlyRate?: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "calculate_payroll",
    description:
      "Compute commissions and gross pay deterministically for one or more staff. Provide each person's service revenue, tips, hours, commission percentage (e.g. 40 for 40%), and hourly rate (0 if commission-only). Returns a per-person and total breakdown. Set save to true to also append the run to the Payroll tab of the owner's sheet. ALWAYS use this for payroll/commission math.",
    input_schema: {
      type: "object",
      properties: {
        period: { type: "string", description: "Pay period label, e.g. 'May 1-15'" },
        save: { type: "boolean", description: "Also persist this run to the Payroll tab" },
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              serviceRevenue: { type: "number" },
              tips: { type: "number" },
              hours: { type: "number" },
              commissionPct: { type: "number" },
              hourlyRate: { type: "number" },
            },
            required: ["name"],
          },
        },
      },
      required: ["entries"],
    },
  },
  {
    name: "save_staff",
    description:
      "Record or update a staff member's commission rate and hourly wage in the Staff tab of the owner's sheet. Call this whenever the owner sets or changes someone's pay structure.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        role: { type: "string" },
        commissionPct: { type: "number", description: "Commission as a percentage, e.g. 40" },
        hourlyRate: { type: "number" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>, salon: string): Promise<unknown> {
  if (name === "calculate_payroll") {
    const entries = (input.entries as Entry[]) ?? [];
    const period = (input.period as string) ?? new Date().toISOString().slice(0, 10);
    const save = Boolean(input.save);

    const rows = entries.map((e) => {
      const serviceRevenue = e.serviceRevenue ?? 0;
      const tips = e.tips ?? 0;
      const hours = e.hours ?? 0;
      const commissionPct = e.commissionPct ?? 0;
      const hourlyRate = e.hourlyRate ?? 0;
      const commission = round2(serviceRevenue * (commissionPct / 100));
      const hourlyPay = round2(hours * hourlyRate);
      const gross = round2(commission + hourlyPay + tips);
      return { name: e.name, serviceRevenue, tips, hours, commission, hourlyPay, gross };
    });

    const totals = rows.reduce(
      (a, r) => ({
        commission: round2(a.commission + r.commission),
        hourlyPay: round2(a.hourlyPay + r.hourlyPay),
        tips: round2(a.tips + r.tips),
        gross: round2(a.gross + r.gross),
      }),
      { commission: 0, hourlyPay: 0, tips: 0, gross: 0 },
    );

    let saved: { ok: boolean; error?: string } | undefined;
    if (save) {
      const headers = ["Salon", "Period", "Name", "Service revenue", "Tips", "Hours", "Commission", "Hourly pay", "Gross pay", "Logged"];
      const now = new Date().toISOString();
      for (const r of rows) {
        saved = await appendSheetRow("Payroll", headers, [
          salon, period, r.name, r.serviceRevenue, r.tips, r.hours, r.commission, r.hourlyPay, r.gross, now,
        ]);
        if (!saved.ok) break;
      }
    }

    return { period, rows, totals, saved };
  }

  if (name === "save_staff") {
    const headers = ["Salon", "Updated", "Name", "Role", "Commission %", "Hourly rate", "Notes"];
    const row = [
      salon,
      new Date().toISOString(),
      (input.name as string) ?? "",
      (input.role as string) ?? "",
      input.commissionPct != null ? `${input.commissionPct}%` : "",
      input.hourlyRate != null ? String(input.hourlyRate) : "",
      (input.notes as string) ?? "",
    ];
    const saved = await appendSheetRow("Staff", headers, row);
    return { saved };
  }

  return { error: `Unknown tool: ${name}` };
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The financial assistant isn't configured yet — ANTHROPIC_API_KEY is not set." },
      { status: 503 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to use the financial assistant." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: Anthropic.MessageParam[] = incoming
    .filter((m: { role?: string; content?: string }) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send a non-empty conversation ending with a user message." }, { status: 400 });
  }

  const client = new Anthropic();

  try {
    let reply = "";
    for (let i = 0; i < 6; i++) {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system: SYSTEM,
        tools: TOOLS,
        messages,
      });

      if (resp.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: resp.content });
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            const out = await runTool(block.name, block.input as Record<string, unknown>, session.salon);
            results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(out) });
          }
        }
        messages.push({ role: "user", content: results });
        continue;
      }

      reply = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      break;
    }

    if (!reply) reply = "I wasn't able to finish that — could you rephrase or give me the numbers again?";
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `${err.status}: ${err.message}` : "assistant error";
    return NextResponse.json({ error: `Financial assistant failed (${message}).` }, { status: 502 });
  }
}

/**
 * POST /api/demo-request — capture a demo lead from the landing page.
 *
 * No database required. The lead is appended to a Google Sheet via an Apps
 * Script webhook (SHEETS_WEBHOOK_URL) and/or emailed via Resend. As long as one
 * sink succeeds the lead is captured; if neither is configured we return an
 * error so the form warns instead of silently dropping the lead.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendHelpEmail } from '@/lib/notify'

type SinkResult = { ok: boolean; skipped?: boolean; error?: string }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const salonName = (body.salonName ?? body.salon_name ?? '').trim()
  const phone = (body.phone ?? '').trim()
  const website = (body.website ?? '').trim()
  const priority = (body.priority ?? '').trim()
  const message = (body.message ?? '').trim()

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const lead = {
    name,
    email,
    salon_name: salonName || null,
    phone: phone || null,
    website: website || null,
    priority: priority || null,
    message: message || null,
    source: (body.source ?? 'salons-landing').trim() || 'salons-landing',
    created_at: new Date().toISOString(),
  }

  // 1. Append to a Google Sheet via the Apps Script webhook (if configured).
  // Apps Script answers a successful doPost with a 302 redirect to its content
  // host (script.googleusercontent.com). That echo step is flaky on Workspace
  // accounts and we don't need the body — so we don't follow the redirect; the
  // 302 itself confirms doPost executed and appended the row.
  let sheet: SinkResult = { ok: false, skipped: true }
  const webhook = process.env.SHEETS_WEBHOOK_URL
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, secret: process.env.SHEETS_WEBHOOK_SECRET }),
        redirect: 'manual',
      })
      const accepted = res.status === 0 || (res.status >= 200 && res.status < 400)
      sheet = accepted ? { ok: true } : { ok: false, error: `Sheet ${res.status}` }
    } catch (err) {
      sheet = { ok: false, error: err instanceof Error ? err.message : 'sheet error' }
    }
  }

  // 2. Email notification via Resend (if configured).
  const notify: SinkResult = await sendHelpEmail({
    name,
    email,
    phone: lead.phone,
    page_name: lead.salon_name,
    concern_type: 'Demo request',
    message:
      `New demo request from the salon landing page.\n\n` +
      `Salon: ${lead.salon_name || 'N/A'}\n` +
      `Website: ${lead.website || 'N/A'}\n` +
      `Phone: ${lead.phone || 'N/A'}\n` +
      `Priority: ${lead.priority || 'N/A'}\n\n` +
      `Notes:\n${message || 'N/A'}`,
  }).catch(() => ({ ok: false, error: 'email crashed' }))

  // Captured as long as at least one sink accepted the lead.
  if (!sheet.ok && !notify.ok) {
    return NextResponse.json(
      { error: 'Lead could not be saved — no storage configured. Set SHEETS_WEBHOOK_URL or RESEND_API_KEY.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, sheet, notification: notify })
}

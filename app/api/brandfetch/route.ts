/**
 * GET /api/brandfetch?q=<website | @instagram | business name>
 *
 * Resolves a prospect's brand identity so the booking demo can re-skin itself
 * to their colors, logo, and name. Strategy:
 *   1. Normalize the input into a domain (strips protocol / www / paths).
 *   2. If we have a domain + a Brandfetch API key, call the Brandfetch Brand API
 *      and map its logos / colors / fonts into a small, stable shape.
 *   3. Otherwise (no key, Instagram-only handle, or a miss) fall back to a
 *      deterministic palette derived from the input so the demo always themes.
 *
 * The response shape never changes between the real and fallback paths, so the
 * client can render the same way regardless of source.
 */
import { NextRequest, NextResponse } from 'next/server'
import { appendSheetRow } from '@/lib/sheets'

export const runtime = 'nodejs'

type BrandResult = {
  ok: true
  source: 'brandfetch' | 'fallback'
  brand: {
    name: string
    domain: string | null
    logoUrl: string | null
    iconUrl: string | null
    primaryColor: string
    accentColor: string
    fontFamily: string | null
  }
  note?: string
}

/** Pull a usable domain (or an Instagram handle) out of free-form input. */
function normalizeInput(raw: string): {
  domain: string | null
  handle: string | null
  kind: 'website' | 'instagram' | 'name' | 'empty'
} {
  let s = (raw || '').trim().toLowerCase()
  if (!s) return { domain: null, handle: null, kind: 'empty' }

  // Bare @handle → Instagram.
  if (s.startsWith('@')) return { domain: null, handle: s.slice(1).split(/[/?#]/)[0], kind: 'instagram' }

  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '')

  // instagram.com/<handle> → Instagram (don't resolve instagram.com itself).
  if (s.includes('instagram.com')) {
    const handle = s.split('instagram.com/')[1]?.split(/[/?#]/)[0] || ''
    return { domain: null, handle: handle || null, kind: 'instagram' }
  }

  // Looks like a domain (has a dot, no spaces) → take the host.
  if (s.includes('.') && !s.includes(' ')) {
    const host = s.split('/')[0].split('?')[0]
    return { domain: host, handle: null, kind: 'website' }
  }

  // Otherwise treat it as a business name (used only for initials + fallback color).
  return { domain: null, handle: null, kind: 'name' }
}

/** Deterministic, on-brand-ish palette from any string (FNV-1a → HSL → hex). */
function fallbackPalette(seed: string): { primary: string; accent: string } {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const hue = Math.abs(h) % 360
  const primary = hslToHex(hue, 58, 38)
  const accent = hslToHex((hue + 26) % 360, 64, 48)
  return { primary, accent }
}

function hslToHex(hRaw: number, s: number, l: number): string {
  const h = hRaw / 360
  const sat = s / 100
  const lig = l / 100
  const k = (n: number) => (n + h * 12) % 12
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => {
    const c = lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Minimal shapes for the Brandfetch fields we read.
type BfFormat = { src?: string; format?: string; width?: number; height?: number }
type BfLogo = { type?: string; theme?: string; formats?: BfFormat[] }
type BfColor = { hex?: string; type?: string; brightness?: number }
type BfFont = { name?: string; type?: string }
type BfBrand = { name?: string; domain?: string; logos?: BfLogo[]; colors?: BfColor[]; fonts?: BfFont[] }

function pickLogo(logos: BfLogo[] = [], want: 'logo' | 'icon'): string | null {
  const ranked = logos.filter((l) => (want === 'icon' ? l.type === 'icon' || l.type === 'symbol' : l.type === 'logo'))
  const pool = ranked.length ? ranked : logos
  for (const fmtPref of ['svg', 'png', 'webp', 'jpeg']) {
    for (const l of pool) {
      const f = (l.formats || []).find((x) => x.format === fmtPref && x.src)
      if (f?.src) return f.src
    }
  }
  return pool[0]?.formats?.[0]?.src ?? null
}

function pickColors(colors: BfColor[] = [], seed: string): { primary: string; accent: string } {
  const byType = (t: string) => colors.find((c) => c.type === t && c.hex)?.hex
  // Prefer a strong brand/dark color for surfaces, an accent for buttons.
  const primary = byType('brand') || byType('dark') || byType('accent') || colors[0]?.hex
  const accent = byType('accent') || byType('brand') || colors.find((c) => c.hex !== primary)?.hex || primary
  if (primary && accent) return { primary, accent }
  return fallbackPalette(seed)
}

async function fetchBrandfetch(domain: string, apiKey: string): Promise<BfBrand | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as BfBrand
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function titleize(s: string): string {
  return s
    .replace(/[-_.]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function recordThemeDemoAttempt(
  request: NextRequest,
  input: string,
  normalized: { domain: string | null; handle: string | null; kind: 'website' | 'instagram' | 'name' | 'empty' },
  result: BrandResult,
) {
  const headers = [
    'Date',
    'Input',
    'Input type',
    'Domain',
    'Instagram handle',
    'Brand name',
    'Source',
    'Referrer',
    'User agent',
  ]

  await appendSheetRow('Theme Demo Tries', headers, [
    new Date().toISOString(),
    input,
    normalized.kind,
    normalized.domain || '',
    normalized.handle || '',
    result.brand.name,
    result.source,
    request.headers.get('referer') || '',
    request.headers.get('user-agent') || '',
  ]).catch(() => undefined)
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const normalized = normalizeInput(q)
  const { domain, handle, kind } = normalized

  if (kind === 'empty') {
    return NextResponse.json({ error: 'Provide a website, @instagram, or business name via ?q=' }, { status: 400 })
  }

  const apiKey = process.env.BRANDFETCH_API_KEY
  const seed = domain || handle || q

  // Try the real Brandfetch lookup only when we have a domain + a key.
  if (domain && apiKey) {
    const bf = await fetchBrandfetch(domain, apiKey)
    if (bf) {
      const { primary, accent } = pickColors(bf.colors, seed)
      const titleFont = bf.fonts?.find((f) => f.type === 'title')?.name || bf.fonts?.[0]?.name || null
      const result: BrandResult = {
        ok: true,
        source: 'brandfetch',
        brand: {
          name: bf.name || titleize(domain.split('.')[0]),
          domain,
          logoUrl: pickLogo(bf.logos, 'logo'),
          iconUrl: pickLogo(bf.logos, 'icon'),
          primaryColor: primary,
          accentColor: accent,
          fontFamily: titleFont,
        },
      }
      await recordThemeDemoAttempt(request, q, normalized, result)
      return NextResponse.json(result)
    }
  }

  // Fallback path: deterministic palette, initials-only logo, friendly note.
  const { primary, accent } = fallbackPalette(seed)
  const name = domain ? titleize(domain.split('.')[0]) : handle ? titleize(handle) : titleize(q)
  const note = !apiKey
    ? 'BRANDFETCH_API_KEY not set — using a generated palette. Add the key for real logos and colors.'
    : kind === 'instagram'
      ? 'Instagram handles return a generated palette. Enter a website domain for the real logo and colors.'
      : 'No brand record found — using a generated palette from the name.'

  const result: BrandResult = {
    ok: true,
    source: 'fallback',
    brand: {
      name,
      domain,
      logoUrl: null,
      iconUrl: null,
      primaryColor: primary,
      accentColor: accent,
      fontFamily: null,
    },
    note,
  }
  await recordThemeDemoAttempt(request, q, normalized, result)
  return NextResponse.json(result)
}

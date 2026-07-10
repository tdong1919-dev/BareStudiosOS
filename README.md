# JIDOKA Cosmetics OS

A customizable operating system for salons, spas, and medspas — sold as a
white-label platform. Mark's GitHub code is now the core app in this repo:
owner login, wallet/POS flows, store checkout, inventory, financials, retention,
reviews, promotions, waitlist/opening alerts, and the marketing/demo layer.

## What's in here today

- **Landing page** (`app/page.tsx`) — hero, pain points, ROI calculator, branded
  demo, revenue operating-system positioning, launch sequence, and demo-request
  CTAs.
- **Owner dashboard** (`app/account/page.tsx`) — passwordless sign-in routes the
  salon owner into the live modules.
- **Mark's platform modules** — client wallet, Stripe Connect, online store,
  financial agent, inventory agent, industry intelligence, re-engagement, reviews,
  rewards/promos, waitlist opt-in, and last-minute opening alerts.
- **Savings calculator** (`components/marketing/SavingsCalculator.tsx`) — two tabs:
  - *Fee savings* — credit-card processing fees today vs. with ACH client wallets.
  - *Revenue lift* — extra-visit revenue from retention + breakage − wallet promo cost.
- **Live brand theming** (`components/marketing/BrandThemedDemo.tsx` + `app/api/brandfetch`)
  — enter a website/Instagram and the booking demo re-skins to the brand's logo,
  colors, and fonts via the Brandfetch API (deterministic palette fallback), then
  shows booking, wallet checkout, rewards, social queue, and inventory reorder
  signals.
- **Demo-request capture** (`components/marketing/DemoCTA.tsx` + `app/api/demo-request`)
  — modal lead form → appended to a Google Sheet (via Apps Script webhook) and/or
  emailed via Resend. No database required. Leads include the prospect's biggest
  bottleneck so outreach can focus on fees, retention/cross-sell, social
  scheduling, rewards, or inventory/reorder.

## Tech stack

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · recharts · Google Sheets +
Resend · Stripe / Stripe Connect · Claude-powered agents · deploy on Netlify
(`@netlify/plugin-nextjs`).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

## Lead storage (Google Sheets)

No database needed. Demo requests are appended to a Google Sheet:

1. Open a Google Sheet → **Extensions → Apps Script**, paste `docs/sheets-webhook.gs`.
2. **Deploy → New deployment → Web app** (execute as you, access "Anyone"), copy the
   `/exec` URL.
3. Set `SHEETS_WEBHOOK_URL` (and optionally `SHEETS_WEBHOOK_SECRET`) in your env.

Leads are also emailed via Resend if `RESEND_API_KEY` is set. The legacy Supabase
schema is kept in `supabase/migrations/` for reference if you later move to Postgres.

## Deploy (Netlify)

1. Connect this repo as a new Netlify site.
2. Build command `npm run build`, plugin `@netlify/plugin-nextjs` (already in `netlify.toml`).
3. Add the environment variables from `.env.example` in **Site settings → Environment variables**.

## Roadmap

- Booking/calendar imports from Mark's live booking data, when available.
- Production database for wallet ledger, inventory sync, and multi-salon scale.
- Retell.ai voice agent for inbound calls.
- Marketing automation (Autom8 integration).
- Twilio SMS for waitlist/opening alerts.

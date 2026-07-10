# Bare Studios OS — Setup & dashboard checklist

This is everything needed to take the app from "builds locally" to "live and fully
working," plus the bigger features that still need real integrations.

---

## 1. Environment variables

Set these in `.env.local` (local) **and** in your Vercel project (Project Settings → Environment Variables). Most features degrade gracefully if a key is missing.

| Variable | Powers | Where to get it | Status |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Financial agent, inventory reorder search, industry intelligence | [console.anthropic.com](https://console.anthropic.com) (pay-as-you-go) | **NEEDED** |
| `SHEETS_WEBHOOK_URL` | All sheet writes (leads, payroll, complaints, inventory, promotions, reviews, clients) | Apps Script `/exec` URL | ✅ you have it |
| `SHEETS_SHEET_ID` | Sheet **reads** (reviews hub, complaint re-ping, client re-engagement) | the long string between `/d/` and `/edit` in your sheet URL | **NEEDED for read features** |
| `SHEETS_WEBHOOK_SECRET` | (optional) reject unknown callers to the Apps Script | any random string (also set in the script) | optional |
| `CRON_SECRET` | Protects `/api/complaint/reping` and `/api/reengagement/digest` | any random string | **NEEDED for crons** |
| `AUTH_SECRET` | Signed dashboard sessions | any long random string (`openssl rand -base64 48`) | **NEEDED for login** |
| `STRIPE_SECRET_KEY` | Stripe Connect (salons link their own Stripe) | Stripe dashboard → API keys (your platform account) | optional, for payments |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect OAuth | Stripe dashboard → Connect → Settings (`ca_…`) | optional, for payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | Stripe dashboard → API keys (`pk_…`) | optional |
| `NEXT_PUBLIC_STRIPE_SUBSCRIPTION_URL` | 7-day trial CTA | Stripe Payment Link / subscription checkout URL | optional, for trial CTA |
| `NEXT_PUBLIC_CRYSTAL_CALENDLY_URL` | Schedule a call with Crystal CTA | Crystal's Calendly booking link | optional |
| `STRIPE_WEBHOOK_SECRET` | Crediting the wallet on load | Stripe → Developers → Webhooks (`whsec_…`) | optional, for wallet |
| `BRANDFETCH_API_KEY` | Brand-theming demo | [developers.brandfetch.com](https://developers.brandfetch.com) | ✅ you have it |
| `RESEND_API_KEY` | All email notifications | [resend.com](https://resend.com) | ✅ you have it |
| `HELP_NOTIFY_EMAIL` | Inbox that receives alerts | your email | ✅ you have it |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs, Stripe callbacks, Retell webhook display | your live Vercel URL | set on deploy |
| `RETELL_API_KEY` | AI phone receptionist / concierge | Retell dashboard | optional, for AI concierge |
| `RETELL_AGENT_ID` | Retell agent to answer Bare Studios calls | Retell dashboard | optional, for AI concierge |

---

## 2. Google Sheet — one-time

1. **Redeploy the Apps Script.** The script in `docs/sheets-webhook.gs` was updated
   to support structured tab writes (`{ tab, headers, row }`) used by the financial,
   inventory, promotions, reviews, and client features. In the Apps Script editor:
   paste the latest `docs/sheets-webhook.gs`, then **Deploy → Manage deployments →
   ✏️ → New version → Deploy** (same `/exec` URL). Without this, only lead capture works.
2. **Tabs are created automatically** on first write: `Leads`, `Staff`, `Payroll`,
   `Complaints`, `Inventory`, `Promotions`, `Reviews`, `Clients`, `Waitlist`,
   `Openings`, `Products`, `Stripe`, `Wallet`, and `ConciergeInbox`.
3. **For the READ features** (reviews hub, complaint re-ping, client re-engagement digest):
   set `SHEETS_SHEET_ID` and share the sheet **"Anyone with the link can view."**
   - ⚠️ **Privacy:** link-view exposes *every* tab (incl. Payroll, Complaints, Clients)
     to anyone who has the link. The link/ID lives only in your server env, but if you
     handle real client data, move to a **service account or a real database** before
     launch. For early testing, link-view is an acceptable tradeoff.
   - If you skip this, read features degrade safely: the reviews hub shows sample
     reviews and the re-ping/digest crons simply find nothing.

---

## 2b. Stripe Connect — let salons use their own Stripe

So each salon's payments settle to *their* Stripe (you never hold their secret key):

1. In your **platform** Stripe account, enable **Connect** (Dashboard → Connect).
2. Connect → **Settings**: copy the **client id** (`ca_…`) → `STRIPE_CONNECT_CLIENT_ID`,
   and add an **OAuth redirect URI**: `https://YOUR-SITE/api/stripe/callback`.
3. Set `STRIPE_SECRET_KEY` (your platform `sk_…`) and `NEXT_PUBLIC_APP_URL`.
4. A salon goes to `/settings/stripe`, clicks **Connect with Stripe**, signs into their
   own Stripe, and approves. We store only their `acct_…` id in a `Stripe` tab.
5. **For the client wallet** (`/wallet`): add a Stripe **webhook** → URL
   `https://YOUR-SITE/api/stripe/webhook`, listening for `checkout.session.completed`
   and `checkout.session.async_payment_succeeded` (enable "listen to Connected accounts"),
   and set `STRIPE_WEBHOOK_SECRET`. Loads credit the `Wallet` tab once payment succeeds
   (ACH credits only after it clears).
   ⚠️ Multi-tenant note: there's no per-salon login yet, so treat connect/wallet as
   owner-initiated / MVP. Add auth before many independent salons self-serve. The wallet
   ledger is sheet-based (append-only) — fine for a demo, but move the money side to a real
   database (transactions) before real volume. (No Stripe secrets are exposed either way.)

## 2c. Auth (passwords on Sheets for MVP)

Owners sign in at `/login` with the password created during account setup. Password hashes and business profile rows live in Google Sheets for this MVP. Move auth to a real database before broader rollout.

To enable:
1. Set `AUTH_SECRET` (any long random string).
2. `SHEETS_SHEET_ID` + link-view must be on (login looks the user up via gviz).
3. The Apps Script must be the redeployed version (writes the `Users` tab).
4. Resend is still used for operational alerts, but password sign-in does not require email magic-link delivery.

## 3. Scheduled jobs (cron)

Three endpoints should run daily. Easiest free option: [cron-job.org](https://cron-job.org)
→ create a daily job for each URL with header `Authorization: Bearer <CRON_SECRET>`
(or append `?secret=<CRON_SECRET>`):

- `https://YOUR-SITE/api/complaint/reping` — re-alerts on complaints open >24h
- `https://YOUR-SITE/api/reengagement/digest` — emails the daily overdue-to-rebook list
- `https://YOUR-SITE/api/promotion/send` — emails the owner promotions scheduled for today

(Vercel Cron Jobs also work, but an external pinger is simplest while testing.)

---

## 4. Deploy to Vercel

1. Vercel → **Add New Project** → import `tdong1919-dev/BareStudiosOS`.
2. Framework preset: Next.js. Build command: `npm run build`.
3. Add all env vars from section 1.
4. After it is live, set `NEXT_PUBLIC_APP_URL` to the production Vercel URL and set up crons (section 3).
5. If using Retell, set the Retell webhook URL to `https://YOUR-SITE/api/retell/webhook`.

---

## 5. What's built (working today)

| Page | What it does |
|---|---|
| `/` | Bare Studios client-facing salon site and booking CTA |
| `/login` · `/dashboard` | Password sign-in + Bare Studios dashboard (session-gated) |
| `/assistants` | Five-assistant command center with reports and action links |
| `/concierge` | AI Concierge inbox for phone calls, chat, SMS, and DMs |
| `/settings/concierge` | Retell-ready setup page and webhook instructions |
| `/financials` | Financial agent — commissions, payroll (deterministic), advice |
| `/inventory` | Flag low stock + AI cheapest-reorder search; tax categories |
| `/intelligence` | Monthly executive industry/competitor briefing |
| `/clients` | Daily list of clients overdue to rebook + add clients |
| `/openings` | Owner posts a last-minute opening and alerts opted-in clients |
| `/waitlist?salon=SalonName` | Public client opt-in form for last-minute openings |
| `/promotions` | Build & schedule rewards/promos with holiday templates |
| `/reviews` | Central reviews wall + leave-a-review |
| `/speak-to-a-manager` | Complaint tickets → owner alerts + 24h re-ping |
| `/settings/stripe` | Salon connects their own Stripe (Connect OAuth) |
| `/wallet` | Client wallet — load via ACH/card, pay from balance (no per-visit fee) |
| `/store` | Online store — sell retail products, checkout to the salon's Stripe |

---

## 6. Still to build (need real integrations / decisions)

These were in the spec but require external services, approvals, or Mark's booking data:

| Feature | What it needs |
|---|---|
| **Auth + per-salon accounts** | ✅ MVP built — password login (`/login`), signed sessions, dashboard (`/dashboard`), onboarding, team/location settings. Remaining: move auth from Sheets to a real database before wider rollout; add staff invites and role permissions |
| **Stripe ACH client wallet** (flagship) | ✅ MVP built — Connect onboarding (`/settings/stripe`) + load/pay (`/wallet`) + webhook. Remaining for production: a real database for the money ledger (transactions, no double-spend) and refunds/disputes handling |
| **Online store** | ✅ MVP built (`/store`) — catalog + Stripe checkout to the salon. Remaining: shipping, inventory sync, order management UI |
| **Google review auto-responder** + **review aggregation** | **Google Business Profile API** (OAuth app + Google verification/approval) |
| **Last-minute cancellation fills** | ✅ Email MVP built — public waitlist opt-in (`/waitlist?salon=...`) + owner opening poster (`/openings`). Remaining: booking calendar data + **Twilio** for SMS |
| **Upsell cues** | Per-client visit/POS history (comes from the booking system) |
| **AUTOM8 marketing suite** (smart schedule, analytics, Brand Brain, comment→DM; TikTok/LinkedIn) | Integrate the existing Autom8 systems, re-branded to JIDOKA |
| **Scheduled promotion sends** | ✅ Owner reminder MVP built (`/api/promotion/send`). Remaining: verified sender domain, audience lists, direct email/SMS sends |
| **Booking / POS / calendar core** | Mark's GitHub platform modules are merged here. Remaining: import/live-sync appointment calendar, service menu, staff schedule, and POS history when Mark's booking data source is available |

**Recommended next:** the Stripe ACH wallet — it's the headline value prop and the
one feature that genuinely warrants a real database (Supabase free tier or similar)
rather than the sheet.


## 7. AI Concierge / Retell MVP

- Dashboard inbox: `/concierge`
- Settings: `/settings/concierge`
- Website/chat intake endpoint: `/api/concierge/message`
- Retell call webhook endpoint: `/api/retell/webhook`
- Google Sheet tab: `ConciergeInbox`

Retell should answer common booking, pricing, barbering, career/rental, and reschedule questions. It should route barbering to Andy at (443) 559-2037, careers/suite/chair rental to Don at (443) 564-0030, and escalation-worthy issues to the owner or manager.

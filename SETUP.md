# JIDOKA Cosmetics OS — Setup & "what's left" checklist

This is everything needed to take the app from "builds locally" to "live and fully
working," plus the bigger features that still need real integrations.

---

## 1. Environment variables

Set these in `.env.local` (local) **and** in your Netlify site (Site settings →
Environment variables). Most features degrade gracefully if a key is missing.

| Variable | Powers | Where to get it | Status |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Financial agent, inventory reorder search, industry intelligence | [console.anthropic.com](https://console.anthropic.com) (pay-as-you-go) | **NEEDED** |
| `SHEETS_WEBHOOK_URL` | All sheet writes (leads, payroll, complaints, inventory, promotions, reviews, clients) | Apps Script `/exec` URL | ✅ you have it |
| `SHEETS_SHEET_ID` | Sheet **reads** (reviews hub, complaint re-ping, client re-engagement) | the long string between `/d/` and `/edit` in your sheet URL | **NEEDED for read features** |
| `SHEETS_WEBHOOK_SECRET` | (optional) reject unknown callers to the Apps Script | any random string (also set in the script) | optional |
| `CRON_SECRET` | Protects `/api/complaint/reping` and `/api/reengagement/digest` | any random string | **NEEDED for crons** |
| `AUTH_SECRET` | Passwordless sign-in (signs magic links + sessions) | any long random string (`openssl rand -base64 48`) | **NEEDED for login** |
| `STRIPE_SECRET_KEY` | Stripe Connect (salons link their own Stripe) | Stripe dashboard → API keys (your platform account) | optional, for payments |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect OAuth | Stripe dashboard → Connect → Settings (`ca_…`) | optional, for payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | Stripe dashboard → API keys (`pk_…`) | optional |
| `NEXT_PUBLIC_STRIPE_SUBSCRIPTION_URL` | 7-day trial CTA | Stripe Payment Link / subscription checkout URL | optional, for trial CTA |
| `NEXT_PUBLIC_CRYSTAL_CALENDLY_URL` | Schedule a call with Crystal CTA | Crystal's Calendly booking link | optional |
| `STRIPE_WEBHOOK_SECRET` | Crediting the wallet on load | Stripe → Developers → Webhooks (`whsec_…`) | optional, for wallet |
| `BRANDFETCH_API_KEY` | Brand-theming demo | [developers.brandfetch.com](https://developers.brandfetch.com) | ✅ you have it |
| `RESEND_API_KEY` | All email notifications | [resend.com](https://resend.com) | ✅ you have it |
| `HELP_NOTIFY_EMAIL` | Inbox that receives alerts | your email | ✅ you have it |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs | your live site URL | set on deploy |

---

## 2. Google Sheet — one-time

1. **Redeploy the Apps Script.** The script in `docs/sheets-webhook.gs` was updated
   to support structured tab writes (`{ tab, headers, row }`) used by the financial,
   inventory, promotions, reviews, and client features. In the Apps Script editor:
   paste the latest `docs/sheets-webhook.gs`, then **Deploy → Manage deployments →
   ✏️ → New version → Deploy** (same `/exec` URL). Without this, only lead capture works.
2. **Tabs are created automatically** on first write: `Leads`, `Staff`, `Payroll`,
   `Complaints`, `Inventory`, `Promotions`, `Reviews`, `Clients`, `Waitlist`,
   `Openings`, `Products`, `Stripe`, and `Wallet`.
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

## 2c. Auth (passwordless, on Sheets)

Owners sign in at `/login` — no passwords. We email a 15-minute magic link
(via Resend), and the session is a signed httpOnly cookie. The `Users` tab holds
only email / salon / role (no secrets).

To enable:
1. Set `AUTH_SECRET` (any long random string).
2. `SHEETS_SHEET_ID` + link-view must be on (login looks the user up via gviz).
3. The Apps Script must be the redeployed version (writes the `Users` tab).
4. ⚠️ **Email delivery:** with Resend's shared sender, magic links only reach the
   address that owns your Resend account until you **verify a domain**. Verify a
   domain in Resend before real salon owners can sign in.

## 3. Scheduled jobs (cron)

Three endpoints should run daily. Easiest free option: [cron-job.org](https://cron-job.org)
→ create a daily job for each URL with header `Authorization: Bearer <CRON_SECRET>`
(or append `?secret=<CRON_SECRET>`):

- `https://YOUR-SITE/api/complaint/reping` — re-alerts on complaints open >24h
- `https://YOUR-SITE/api/reengagement/digest` — emails the daily overdue-to-rebook list
- `https://YOUR-SITE/api/promotion/send` — emails the owner promotions scheduled for today

(Netlify Scheduled Functions also work, but an external pinger is simplest for Next routes.)

---

## 4. Deploy to Netlify

1. Netlify → **Add new site → Import from Git** → pick `Salon_platform_w_Mark`.
2. Build command `npm run build`; the `@netlify/plugin-nextjs` runtime is in `netlify.toml`.
3. Add all the env vars from section 1.
4. After it's live, set `NEXT_PUBLIC_APP_URL` to the real URL and set up the crons (section 3).

---

## 5. What's built (working today)

| Page | What it does |
|---|---|
| `/` | Landing page, ROI calculator, brand-theming demo, demo-request capture |
| `/login` · `/account` | Passwordless sign-in + the salon's dashboard (session-gated) |
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
| **Auth + per-salon accounts** | ✅ MVP built — passwordless login (`/login`), signed sessions, salon dashboard (`/account`). Remaining: verify a Resend domain for delivery; wire the existing feature pages to read the salon from the session (instead of `?salon=` params); add roles/staff invites |
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

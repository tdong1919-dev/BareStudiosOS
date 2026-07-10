# Bare Studios OS

Client project for adapting the JIDOKA Cosmetics OS into a Bare Studios operating system that can replace Vagaro workflows without changing the main JIDOKA demo/product project.

## Objective

Bare Studios OS should become the operational home for booking, client profiles, checkout, client wallet/rewards, inventory, reviews, team communication, scheduling, and assistant-powered reporting.

This project should stay separate from the generic JIDOKA Cosmetics OS codebase so Bare Studios can have its own workflow, branding, data model, migration plan, Stripe products, and onboarding flow.

## Migration From Vagaro

Core data to migrate:

- Services, categories, durations, prices, deposits, and cancellation rules
- Staff profiles, schedules, roles, permissions, and availability
- Existing clients, notes, forms, package balances, memberships, and visit history
- Upcoming appointments and waitlist requests
- Product catalog, inventory counts, reorder thresholds, vendors, and COGS
- Gift cards, rewards, wallet balances, and promotion history
- Reviews and reputation data from Google Business Profile and legacy booking tools

Replacement modules:

- Bare-owned `/book` page to replace Vagaro/Shorby booking buttons on barestudios.site
- Booking and client-facing mobile appointment flow
- Owner dashboard with assistant hub
- Password-based user accounts
- Required onboarding before dashboard access
- Team member management, free for 3 teammates per location
- Multi-location management with owner, manager, and team member roles
- Toggleable cross-location visibility for availability and inventory counts
- Stripe subscription billing for locations and paid teammate add-ons
- Stripe Connect/payment flows for Bare Studios checkout and client wallet

## Account Setup Flow

New users should:

1. Create a password.
2. Complete business onboarding before seeing the dashboard.
3. Add name, address, phone, team account count, and feature-interest checklist.
4. Choose whether they have multiple locations.
5. Add team members and locations where allowed.

Feature-interest tracking should be stored in the database so Bare Studios/JIDOKA can see what users care about most:

- Booking replacement
- Lower payment fees and client wallet
- Client retention and rewards
- Inventory tracking and reorder assistant
- Social media and marketing scheduling
- Reviews assistant
- Financial reports and payroll visibility
- Team scheduling and multi-location visibility
- All of the above

## Billing Rules

- Each location has its own monthly subscription.
- Each location includes 3 free team members.
- Every teammate after the first 3 is billed at $5 per month.
- Users cannot add a paid teammate or new location until the Stripe checkout is completed.
- Billing records should be written into the database after successful Stripe checkout/webhook confirmation.

## Stripe Price Ideas

Recommended simple launch pricing:

- Bare Studios OS Location Subscription: $297/month per location
- Extra Team Member Add-on: $5/month per teammate after 3 included seats
- Optional Guided Implementation: $750 one time

Higher-positioned option:

- Location Subscription: $497/month per location
- Extra Team Member Add-on: $5/month
- Guided Implementation: $1,500 one time

Enterprise/multi-location option:

- Location Subscription: $797/month per location
- Extra Team Member Add-on: $5/month
- Guided Implementation: $2,500+ one time

My suggested Stripe setup for the first Bare Studios rollout:

- Create one recurring monthly product called `Bare Studios OS - Location`.
- Create one recurring monthly product called `Bare Studios OS - Extra Team Member`.
- Use a 7-day free trial on the location subscription.
- Start with $297/month/location while the workflow is being proven.
- Keep the $5/month/team member add-on exactly as planned.

## Current Project State

This folder was created from the current JIDOKA Cosmetics OS app and already includes the beginning of password-based login/register support:

- `app/api/auth/register`
- `app/api/auth/login`
- `lib/password-auth.ts`
- `lib/account-data.ts`
- updated login form for password sign-in/account creation

Built in this client project:

- Password account creation and sign-in
- Required business onboarding before dashboard access
- Team/location settings with 3 included teammates per location
- Stripe subscription checkout gates for extra teammates and added locations
- `/book` appointment request flow to replace the current Vagaro/Shorby booking handoff
- `/migration` cutover checklist for moving Bare Studios off Vagaro

Next build step: deploy this as its own Bare Studios OS project, add the Stripe price IDs, connect the Google Sheet/database, and replace the current barestudios.site booking links with the deployed `/book` URL.

## Website Integration Notes

Current barestudios.site booking links send visitors to Vagaro/Shorby. The first replacement path in this project is:

- `/book` for service appointment requests
- `/login` for owner/team access
- `/migration` for the internal Vagaro cutover checklist

When the Bare Studios OS deployment URL exists, replace the current `Book Now`, `Book A Service Appointment`, and discounted facial booking links with the deployed `/book` URL.

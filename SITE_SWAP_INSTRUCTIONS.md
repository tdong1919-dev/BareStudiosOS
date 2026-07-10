# Bare Studios Website Swap Instructions

The current Bare Studios website sends booking traffic away from the website to Vagaro/Shorby links. Once Bare Studios OS is deployed, replace those links with the deployed Bare Studios OS booking URL.

## Replace These Website CTAs

- `Book Now`
- `Discounted Facials Here`
- `Book A Service Appointment`
- Any mobile/menu booking button that currently points to Vagaro or Shorby

## New Links

- Client booking: `/book`
- Studio suite applications: `/suite-rental`
- Owner/team login: `/login`
- Internal migration checklist: `/migration`

When deployed, these become:

- `https://YOUR-BARE-STUDIOS-OS-DOMAIN/book`
- `https://YOUR-BARE-STUDIOS-OS-DOMAIN/suite-rental`
- `https://YOUR-BARE-STUDIOS-OS-DOMAIN/login`
- `https://YOUR-BARE-STUDIOS-OS-DOMAIN/migration`

## First Cutover Order

1. Deploy Bare Studios OS.
2. Connect environment variables from `.env.example`.
3. Test `/book` with internal staff.
4. Confirm booking requests write into the `BookingRequests` database table.
5. Replace one website booking button with `/book`.
6. Test on mobile.
7. Replace every remaining Vagaro/Shorby booking link.

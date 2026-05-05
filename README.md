# Artune

A Next.js 14 platform for booking art classes (oil painting, manga, miniature, sculpting) in Kuwait. Phone+OTP signup or username/password login, seat-capped booking, mock K-Net payment that can be swapped for a real merchant integration via env vars.

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** with the violet/indigo galaxy theme
- **Supabase** (Postgres + Auth + RLS) via `@supabase/ssr` and `@supabase/supabase-js`
- **bcryptjs** for the user-chosen password (stored in `profiles.password_hash`); a custom OTP issued from `verifications` and delivered over WhatsApp/SMS via Twilio
- **zod** + **react-hook-form** for validation

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + keys
npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is taken).

The schema, seed data (4 classes × 30 days × 2 timings), and RLS policies live in Supabase migrations applied via the Supabase MCP — see the project's migration history in the dashboard.

### Mocked services

- **OTP**: `lib/sms.ts` switches between `mock` (console log), `twilio` (real SMS), and `whatsapp` (Twilio sandbox) via `SMS_PROVIDER`.
- **K-Net**: `/payment/mock-knet/[id]` is a fake gateway page with **Pay** / **Cancel** buttons that hit a signed callback at `/api/payment/callback`.

## How auth works

- **Custom OTP path** (default): user enters their Kuwait phone → server issues a 6-digit code into `verifications` and sends it via Twilio → user enters the code → server verifies it → mints a Supabase Auth session by rotating the user's `auth.users.encrypted_password` to a fresh random and calling `signInWithPassword` with the phantom email (`{uuid}@phone.artune.local`).
- **Username/password path**: bcrypt hash lives in `profiles.password_hash`. On login the server verifies it, then mints a Supabase session the same way.
- The `auth.users` password is treated as ephemeral — never persisted, rotated on every login. The user-facing password and the Supabase Auth password are intentionally decoupled.
- Row Level Security gates all `profiles` and `bookings` reads to the owner; `verifications` is service-role-only; `class_types`/`class_slots` are public read.

## End-to-end test

1. Visit `/` → enter your Kuwait mobile (e.g. `60001234`) → submit. WhatsApp / SMS / console (depending on `SMS_PROVIDER`) delivers the 6-digit code.
2. Enter the code on `/verify-otp` → land on `/dashboard`. Set your name.
3. Click **Book** → pick a class → pick a timing → **Proceed to payment**.
4. On the mock K-Net page, click **Pay**. You'll land on the confirmation page with status **PAID**.
5. Return to `/dashboard` — the booking now appears in the list.

## Going to production

Swap the dev defaults with real services. Nothing else in the app changes:

| Concern | Local default | Production swap |
|---|---|---|
| Database | Supabase free-tier project | Supabase paid tier, or migrate the schema/seed into your own Postgres. |
| Auth secret | Supabase manages it | Same — Supabase rotates JWT secrets via the dashboard. |
| OTP/SMS | console log | `SMS_PROVIDER=twilio` (real SMS) or `whatsapp` (Twilio sandbox / approved sender) + `TWILIO_*` env vars. |
| K-Net payment | `/payment/mock-knet/[id]` | `KNET_PROVIDER=live` + `KNET_MERCHANT_ID`/`TRANSPORTAL_PASSWORD`/etc., and replace `buildRedirectUrl` + `verifyCallback` in `lib/knet.ts` with the real K-Net hosted-page request and response signature verification. |
| Hosting | local | Vercel: connect this repo, set the env vars above. |

## Project layout

```
artune/
├── app/
│   ├── layout.tsx           # fonts + galaxy bg + StarField
│   ├── page.tsx             # landing (signup + login tabs)
│   ├── verify-otp/          # OTP entry
│   ├── (app)/               # protected route group (auth guard in layout)
│   │   ├── dashboard/       # welcome + booked classes
│   │   ├── booking/         # class picker + slot picker + confirmation
│   │   └── payment/         # mock K-Net page
│   └── api/                 # auth, bookings, payment routes
├── components/              # UI components
├── lib/
│   ├── supabase/            # server, admin (service-role) client factories
│   ├── auth.ts              # getCurrentUser / requireUser / mintSessionForUser
│   ├── otp.ts               # custom OTP issuance + verification
│   ├── bookings.ts          # listing, atomic booking RPC, status mutations
│   ├── knet.ts              # mock K-Net signing + callback verification
│   └── sms.ts, classes.ts, validators.ts, utils.ts
└── middleware.ts            # refreshes Supabase session on every request
```

## Things explicitly out of scope (for now)

- Real K-Net merchant integration
- Real SMS gateway
- Admin UI for managing classes/slots (use the Supabase Studio dashboard)
- Calendar / month picker (we show the next available date)
- Refunds, cancellations, rescheduling
- i18n / Arabic translation
- Email receipts

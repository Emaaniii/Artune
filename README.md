# Arting

A scalable Next.js 14 platform for booking art classes (oil painting, manga, miniature, sculpting) in Kuwait. Phone+OTP signup or username/password login, seat-capped booking, mock K-Net payment that can be swapped for a real merchant integration via env vars.

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** with the violet/indigo galaxy theme
- **Prisma** + **SQLite (local dev)** / **Postgres (production)**
- **iron-session** (encrypted httpOnly cookie) + **bcryptjs**
- **zod** + **react-hook-form** for validation

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Mocked services

- **OTP**: `lib/sms.ts` logs codes to the **server console**. Watch the terminal running `npm run dev`.
- **K-Net**: `/payment/mock-knet/[id]` is a fake gateway page with **Pay** / **Cancel** buttons that hit a signed callback at `/api/payment/callback`.

## End-to-end test

1. Visit `/` → enter `60001234` → submit. The terminal will log a 6-digit code.
2. Enter the code on `/verify-otp` → land on `/dashboard`. Set your name.
3. Click **Book one** → pick a class → pick a timing → **Proceed to payment**.
4. On the mock K-Net page, click **Pay**. You'll land on the confirmation page with status **PAID**.
5. Return to `/dashboard` — the booking now appears in the list.

## Going to production

Swap the dev defaults with real services. Nothing else in the app changes:

| Concern | Local default | Production swap |
|---|---|---|
| Database | SQLite (`file:./dev.db`) | Postgres on Neon: set `DATABASE_URL=postgresql://…` and change the `provider` in `prisma/schema.prisma` to `"postgresql"`. Re-run `prisma migrate dev`. |
| Session secret | dummy string in `.env` | `openssl rand -hex 32` → `SESSION_SECRET=…` |
| OTP/SMS | console log | Set `SMS_PROVIDER=twilio` + Twilio creds and add a `twilio` branch in `lib/sms.ts`. |
| K-Net payment | `/payment/mock-knet/[id]` | Set `KNET_PROVIDER=live` + `KNET_MERCHANT_ID`/`TRANSPORTAL_PASSWORD`/etc., and replace `buildRedirectUrl` + `verifyCallback` in `lib/knet.ts` with the real K-Net hosted-page request and response signature verification. |
| Hosting | local | Vercel: connect this repo, set the env vars above. Neon Postgres has a generous free tier. |

## Project layout

```
arting/
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
├── lib/                     # db, session, auth, otp, sms, knet, classes, bookings, validators, utils
└── prisma/                  # schema + seed
```

## Things explicitly out of scope (for now)

- Real K-Net merchant integration
- Real SMS gateway
- Admin UI for managing classes/slots (use `npx prisma studio`)
- Calendar / month picker (we show the next available date)
- Refunds, cancellations, rescheduling
- i18n / Arabic translation
- Email receipts

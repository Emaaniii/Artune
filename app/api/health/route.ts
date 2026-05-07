import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint — reports which required env vars are present (not their
 * values). Useful for debugging deploys: `curl <deploy>/api/health`.
 *
 * Public env vars: any leakage already exists in the bundle.
 * Secret env vars: we only report `present: true|false`, never the value.
 */
export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_present: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY_present: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    KNET_HMAC_SECRET_present: Boolean(process.env.KNET_HMAC_SECRET),
    SESSION_SECRET_present: Boolean(process.env.SESSION_SECRET),
    APP_URL: process.env.APP_URL ?? null,
    SMS_PROVIDER: process.env.SMS_PROVIDER ?? null,
    TWILIO_ACCOUNT_SID_present: Boolean(process.env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN_present: Boolean(process.env.TWILIO_AUTH_TOKEN),
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM ?? null,
  };

  const missing = Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY_present,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY_present,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    env,
    runtime: {
      node: process.version,
      vercel_region: process.env.VERCEL_REGION ?? null,
      vercel_env: process.env.VERCEL_ENV ?? null,
    },
  });
}

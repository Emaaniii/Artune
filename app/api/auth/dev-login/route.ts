// Dev-only fail-safe login.
//
// Purpose: when the WhatsApp / SMS OTP path is broken (e.g. the Twilio
// Sandbox kicked the recipient out, or the user has no `password_hash` set
// yet so the regular username+password login can't help them either), this
// route lets an operator log in by proving knowledge of a shared secret
// (`AUTH_DEV_BYPASS_KEY`).
//
// Safety:
//   - If `AUTH_DEV_BYPASS_KEY` is unset OR shorter than 16 chars, the route
//     pretends it doesn't exist (404). Production env should never set it.
//   - Comparison is constant-time.
//   - Only logs in an *existing* profile — never creates one.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { mintSessionForUser } from "@/lib/auth";
import { KuwaitPhone } from "@/lib/validators";

const Input = z.object({
  phone: KuwaitPhone,
  devKey: z.string().min(1),
});

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const expected = process.env.AUTH_DEV_BYPASS_KEY ?? "";
  if (expected.length < 16) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  if (!constantTimeEquals(parsed.data.devKey, expected)) {
    return NextResponse.json({ error: "Invalid bypass key." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, name")
    .eq("phone", parsed.data.phone)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json(
      { error: "No account exists for that phone." },
      { status: 404 },
    );
  }

  try {
    await mintSessionForUser(profile.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sign-in failed" },
      { status: 500 },
    );
  }

  console.warn(
    `[auth] dev-login bypass used for ${parsed.data.phone} → profile ${profile.id}`,
  );
  return NextResponse.json({ ok: true, needsName: !profile.name });
}

// Email + password signup. No OTP, no Twilio — for testers and anyone who
// doesn't have a Kuwait mobile number ready.
//
// Mirrors the phone-OTP signup's user-creation pattern: each profile has a
// matching auth.users row with a *phantom* email, and the user-facing email
// + password live on the public.profiles row (email column, password_hash
// column). The login route already accepts either email or username, so once
// signup succeeds the same person can come back via the Login tab.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { mintSessionForUser } from "@/lib/auth";
import { EmailSignupInput } from "@/lib/validators";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EmailSignupInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const admin = getSupabaseAdmin();

  // Email column is citext, so this lookup is case-insensitive.
  const { data: existing, error: lookupErr } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json(
      { error: `Lookup failed: ${lookupErr.message}` },
      { status: 500 },
    );
  }
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in." },
      { status: 409 },
    );
  }

  // auth.users.email is a phantom value — sessions are minted via
  // mintSessionForUser, which rotates the password and signs in with this
  // address. The user's *real* email lives on profiles.email and is what the
  // login route looks up.
  const phantomEmail = `${randomUUID()}@email.artune.local`;
  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email: phantomEmail,
      password: randomBytes(32).toString("hex"),
      email_confirm: true,
    });
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: `Could not create user: ${createErr?.message ?? "unknown"}` },
      { status: 500 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    name,
    email,
    password_hash: passwordHash,
    role: "USER",
  });
  if (profileErr) {
    // Roll back the orphan auth.users row so the next attempt isn't blocked.
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return NextResponse.json(
      { error: `Could not create profile: ${profileErr.message}` },
      { status: 500 },
    );
  }

  try {
    await mintSessionForUser(created.user.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sign-in failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

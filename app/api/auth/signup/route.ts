import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { issueOtp } from "@/lib/otp";
import { SignupInput } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    return await handleSignup(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[signup]", msg);
    return NextResponse.json(
      { error: msg, hint: "Check /api/health for missing env vars." },
      { status: 500 },
    );
  }
}

async function handleSignup(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SignupInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { phone } = parsed.data;
  const admin = getSupabaseAdmin();

  // Is there already a profile for this phone? (RLS bypassed via service role.)
  const { data: existing, error: lookupErr } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json(
      { error: `Lookup failed: ${lookupErr.message}` },
      { status: 500 },
    );
  }

  if (!existing) {
    // Create the auth.users row first. Email is a phantom — we never read mail
    // to it; signInWithPassword just needs *some* unique address.
    const phantomEmail = `${randomUUID()}@phone.artune.local`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
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

    const { error: profileErr } = await admin
      .from("profiles")
      .insert({ id: created.user.id, phone, role: "USER" });
    if (profileErr) {
      // Roll back the orphan auth.users row so the next attempt isn't blocked.
      await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
      return NextResponse.json(
        { error: `Could not create profile: ${profileErr.message}` },
        { status: 500 },
      );
    }
  }

  await issueOtp(phone);
  return NextResponse.json({ ok: true });
}

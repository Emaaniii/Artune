import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/otp";
import { mintSessionForUser } from "@/lib/auth";
import { VerifyOtpInput } from "@/lib/validators";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = VerifyOtpInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { phone, code } = parsed.data;
  const ok = await verifyOtp(phone, code);
  if (!ok) {
    return NextResponse.json(
      { error: "Code is incorrect or expired." },
      { status: 401 },
    );
  }

  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, name")
    .eq("phone", phone)
    .maybeSingle();
  if (error || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await mintSessionForUser(profile.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sign-in failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, needsName: !profile.name });
}

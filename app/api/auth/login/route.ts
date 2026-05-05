import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { mintSessionForUser } from "@/lib/auth";
import { LoginInput } from "@/lib/validators";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LoginInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;
  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error || !profile || !profile.password_hash) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(password, profile.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
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

  return NextResponse.json({ ok: true });
}

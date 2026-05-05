import "server-only";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { getSupabaseServer } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";

export interface ArtuneUser {
  id: string;
  phone: string;
  name: string | null;
  username: string | null;
  role: string;
}

export async function getCurrentUser(): Promise<ArtuneUser | null> {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("phone, name, username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    id: user.id,
    phone: profile.phone ?? "",
    name: profile.name,
    username: profile.username,
    role: profile.role,
  };
}

export async function requireUser(): Promise<ArtuneUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/");
  return u;
}

// Establishes a Supabase Auth session for the given user by rotating the row's
// password to a fresh random value and signing in with it. The user's chosen
// password (if any) lives in profiles.password_hash; auth.users.encrypted_password
// is treated as ephemeral so we never have to remember it across requests.
export async function mintSessionForUser(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const tmpPassword = randomBytes(32).toString("hex");

  const { data: updated, error: upErr } = await admin.auth.admin.updateUserById(
    userId,
    { password: tmpPassword },
  );
  if (upErr || !updated.user?.email) {
    throw new Error(`mintSession: update failed (${upErr?.message ?? "no email"})`);
  }

  const supabase = getSupabaseServer();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: updated.user.email,
    password: tmpPassword,
  });
  if (signInErr) {
    throw new Error(`mintSession: signIn failed (${signInErr.message})`);
  }
}

export async function clearSession(): Promise<void> {
  const supabase = getSupabaseServer();
  await supabase.auth.signOut();
}

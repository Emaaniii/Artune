import "server-only";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "./supabase/admin";
import { sendSms } from "./sms";

const TTL_MIN = 10;

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(phone: string): Promise<{ code: string }> {
  const code = genCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + TTL_MIN * 60 * 1000).toISOString();

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("verifications")
    .insert({ phone, code_hash: codeHash, expires_at: expiresAt, consumed: false });
  if (error) throw new Error(`issueOtp: ${error.message}`);

  await sendSms(
    phone,
    `Your Artune verification code is ${code}. Expires in ${TTL_MIN} minutes.`,
  );
  return { code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from("verifications")
    .select("id, code_hash")
    .eq("phone", phone)
    .eq("consumed", false)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return false;

  const ok = await bcrypt.compare(code, data.code_hash);
  if (!ok) return false;

  const { error: upErr } = await admin
    .from("verifications")
    .update({ consumed: true })
    .eq("id", data.id);
  if (upErr) return false;

  return true;
}

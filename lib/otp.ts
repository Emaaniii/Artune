import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { sendSms } from "./sms";

const TTL_MIN = 10;

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(phone: string): Promise<{ code: string }> {
  const code = genCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + TTL_MIN * 60 * 1000);

  await prisma.verification.create({
    data: { phone, codeHash, expiresAt, consumed: false },
  });

  await sendSms(phone, `Your Artune verification code is ${code}. Expires in ${TTL_MIN} minutes.`);
  return { code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const v = await prisma.verification.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!v) return false;

  const ok = await bcrypt.compare(code, v.codeHash);
  if (!ok) return false;

  await prisma.verification.update({
    where: { id: v.id },
    data: { consumed: true },
  });
  return true;
}

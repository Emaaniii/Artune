import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { setSessionUser } from "@/lib/auth";
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

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await setSessionUser(user.id, user.phone);
  return NextResponse.json({ ok: true, needsName: !user.name });
}

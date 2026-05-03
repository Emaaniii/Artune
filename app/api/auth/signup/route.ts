import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { SignupInput } from "@/lib/validators";

export async function POST(req: Request) {
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
  // Upsert (create the user lazily; OTP verification confirms the phone).
  await prisma.user.upsert({
    where: { phone },
    create: { phone },
    update: {},
  });

  await issueOtp(phone);
  return NextResponse.json({ ok: true });
}

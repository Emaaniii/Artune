import { z } from "zod";

// Kuwait mobile: +965 followed by 8 digits, mobile prefixes start with 5/6/9.
export const KuwaitPhone = z
  .string()
  .trim()
  .regex(/^\+965[569]\d{7}$/, "Enter a valid Kuwait mobile number");

export const SignupInput = z.object({
  phone: KuwaitPhone,
});

export const VerifyOtpInput = z.object({
  phone: KuwaitPhone,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const LoginInput = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(6).max(200),
});

export const NameInput = z.object({
  name: z.string().trim().min(1).max(60),
});

export const BookingInput = z.object({
  slotId: z.string().min(1),
});

// Accept inputs like "60001234", "6000 1234", "+965 6000-1234" → "+9656001234".
export function normalizeKuwaitPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip a leading 965 if user typed it without the +.
  const without965 = digits.startsWith("965") ? digits.slice(3) : digits;
  return `+965${without965}`;
}

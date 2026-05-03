import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./db";

export async function getCurrentUser() {
  const s = await getSession();
  if (!s.userId) return null;
  return prisma.user.findUnique({ where: { id: s.userId } });
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/");
  return u;
}

export async function setSessionUser(userId: string, phone: string) {
  const s = await getSession();
  s.userId = userId;
  s.phone = phone;
  await s.save();
}

export async function clearSession() {
  const s = await getSession();
  s.destroy();
}

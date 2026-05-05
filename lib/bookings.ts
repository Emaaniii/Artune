import { prisma } from "./db";

const ACTIVE = ["PENDING", "PAID"];

export async function listUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { slot: { include: { classType: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingForUser(bookingId: string, userId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { slot: { include: { classType: true } } },
  });
}

export async function seatsAvailable(slotId: string): Promise<number> {
  const slot = await prisma.classSlot.findUnique({
    where: { id: slotId },
    include: { _count: { select: { bookings: { where: { status: { in: ACTIVE } } } } } },
  });
  if (!slot) return 0;
  return Math.max(0, slot.maxSeats - slot._count.bookings);
}

export async function getNextSlotsForClass(classSlug: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ct = await prisma.classType.findUnique({ where: { slug: classSlug } });
  if (!ct) return null;

  const slots = await prisma.classSlot.findMany({
    where: { classTypeId: ct.id, date: { gte: today } },
    orderBy: [{ date: "asc" }, { startsAt: "asc" }],
    take: 4,
    include: { _count: { select: { bookings: { where: { status: { in: ACTIVE } } } } } },
  });
  if (!slots.length) return { classType: ct, slots: [] as typeof slots };

  // Show only the soonest date that has at least one slot; both timings of that date.
  const firstDateMs = slots[0].date.getTime();
  const sameDay = slots.filter((s) => s.date.getTime() === firstDateMs);

  return { classType: ct, slots: sameDay };
}

export async function getUpcomingSlotsForClass(classSlug: string, daysAhead = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until = new Date(today);
  until.setDate(today.getDate() + daysAhead);

  const ct = await prisma.classType.findUnique({ where: { slug: classSlug } });
  if (!ct) return null;

  const slots = await prisma.classSlot.findMany({
    where: { classTypeId: ct.id, date: { gte: today, lt: until } },
    orderBy: [{ date: "asc" }, { startsAt: "asc" }],
    include: { _count: { select: { bookings: { where: { status: { in: ACTIVE } } } } } },
  });

  const buckets = new Map<
    string,
    {
      date: Date;
      slots: Array<{
        id: string;
        startsAt: string;
        endsAt: string;
        maxSeats: number;
        seatsLeft: number;
      }>;
    }
  >();

  for (const s of slots) {
    const key = s.date.toISOString().slice(0, 10);
    const seatsLeft = Math.max(0, s.maxSeats - s._count.bookings);
    const entry = buckets.get(key) ?? { date: s.date, slots: [] };
    entry.slots.push({
      id: s.id,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      maxSeats: s.maxSeats,
      seatsLeft,
    });
    buckets.set(key, entry);
  }

  const slotsByDate = Array.from(buckets.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return { classType: ct, slotsByDate };
}

export async function createPendingBooking(userId: string, slotId: string) {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.classSlot.findUnique({
      where: { id: slotId },
      include: {
        classType: true,
        _count: { select: { bookings: { where: { status: { in: ACTIVE } } } } },
      },
    });
    if (!slot) throw new Error("SLOT_NOT_FOUND");
    const taken = slot._count.bookings;
    if (taken >= slot.maxSeats) throw new Error("SLOT_FULL");

    return tx.booking.create({
      data: {
        userId,
        slotId,
        amountFils: slot.classType.priceFils,
        status: "PENDING",
      },
      include: { slot: { include: { classType: true } } },
    });
  });
}

export async function markBookingPaid(bookingId: string, paymentRef: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAID", paymentRef, paidAt: new Date() },
  });
}

export async function cancelBooking(bookingId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

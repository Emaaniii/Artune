import "server-only";
import { getSupabaseServer } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";

const ACTIVE = ["PENDING", "PAID"] as const;

// ---- Shapes returned to callers (mirrors the previous Prisma shapes so the
// consumer components don't have to change) ----

export interface BookingWithSlot {
  id: string;
  status: string;
  amountFils: number;
  paymentRef: string | null;
  createdAt: Date;
  paidAt: Date | null;
  slot: {
    id: string;
    date: Date;
    startsAt: string;
    endsAt: string;
    classType: { name: string; slug: string; imageUrl: string };
  };
}

interface SlotRow {
  id: string;
  date: string;
  starts_at: string;
  ends_at: string;
  class_type: { name: string; slug: string; image_url: string } | null;
}

interface BookingRow {
  id: string;
  status: string;
  amount_fils: number;
  payment_ref: string | null;
  created_at: string;
  paid_at: string | null;
  slot: SlotRow | null;
}

function mapBooking(b: BookingRow): BookingWithSlot {
  if (!b.slot || !b.slot.class_type) {
    throw new Error(`Booking ${b.id} missing slot/class_type`);
  }
  return {
    id: b.id,
    status: b.status,
    amountFils: b.amount_fils,
    paymentRef: b.payment_ref,
    createdAt: new Date(b.created_at),
    paidAt: b.paid_at ? new Date(b.paid_at) : null,
    slot: {
      id: b.slot.id,
      date: new Date(b.slot.date),
      startsAt: b.slot.starts_at,
      endsAt: b.slot.ends_at,
      classType: {
        name: b.slot.class_type.name,
        slug: b.slot.class_type.slug,
        imageUrl: b.slot.class_type.image_url,
      },
    },
  };
}

const BOOKING_SELECT = `
  id, status, amount_fils, payment_ref, created_at, paid_at,
  slot:slot_id (
    id, date, starts_at, ends_at,
    class_type:class_type_id ( name, slug, image_url )
  )
`;

export async function listUserBookings(userId: string): Promise<BookingWithSlot[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listUserBookings: ${error.message}`);
  return (data ?? []).map((row) => mapBooking(row as unknown as BookingRow));
}

export async function getBookingForUser(
  bookingId: string,
  userId: string,
): Promise<BookingWithSlot | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapBooking(data as unknown as BookingRow);
}

export async function seatsAvailable(slotId: string): Promise<number> {
  const supabase = getSupabaseServer();
  const [{ data: slot }, { count }] = await Promise.all([
    supabase
      .from("class_slots")
      .select("max_seats")
      .eq("id", slotId)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("slot_id", slotId)
      .in("status", ACTIVE as unknown as string[]),
  ]);
  if (!slot) return 0;
  return Math.max(0, slot.max_seats - (count ?? 0));
}

export async function getNextSlotsForClass(classSlug: string) {
  const upcoming = await getUpcomingSlotsForClass(classSlug, 30);
  if (!upcoming) return null;
  // Show only the soonest date that has at least one slot; both timings of that date.
  const first = upcoming.slotsByDate[0];
  if (!first) return { classType: upcoming.classType, slots: [] };
  return {
    classType: upcoming.classType,
    slots: first.slots.map((s) => ({
      id: s.id,
      date: first.date,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      maxSeats: s.maxSeats,
      seatsLeft: s.seatsLeft,
    })),
  };
}

export interface UpcomingSlots {
  classType: {
    id: string;
    slug: string;
    name: string;
    blurb: string;
    imageUrl: string;
    priceFils: number;
  };
  slotsByDate: Array<{
    date: Date;
    slots: Array<{
      id: string;
      startsAt: string;
      endsAt: string;
      maxSeats: number;
      seatsLeft: number;
    }>;
  }>;
}

export async function getUpcomingSlotsForClass(
  classSlug: string,
  daysAhead = 14,
): Promise<UpcomingSlots | null> {
  const supabase = getSupabaseServer();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until = new Date(today);
  until.setDate(today.getDate() + daysAhead);

  const { data: ctRow } = await supabase
    .from("class_types")
    .select("id, slug, name, blurb, image_url, price_fils")
    .eq("slug", classSlug)
    .maybeSingle();
  if (!ctRow) return null;

  const classType = {
    id: ctRow.id,
    slug: ctRow.slug,
    name: ctRow.name,
    blurb: ctRow.blurb,
    imageUrl: ctRow.image_url,
    priceFils: ctRow.price_fils,
  };

  const { data: slots, error } = await supabase
    .from("class_slots")
    .select("id, date, starts_at, ends_at, max_seats, bookings(status)")
    .eq("class_type_id", classType.id)
    .gte("date", today.toISOString().slice(0, 10))
    .lt("date", until.toISOString().slice(0, 10))
    .order("date", { ascending: true })
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`getUpcomingSlotsForClass: ${error.message}`);

  const buckets = new Map<string, UpcomingSlots["slotsByDate"][number]>();
  for (const s of slots ?? []) {
    const taken = (s.bookings ?? []).filter((b: { status: string }) =>
      (ACTIVE as readonly string[]).includes(b.status),
    ).length;
    const seatsLeft = Math.max(0, s.max_seats - taken);
    const key = s.date;
    const entry = buckets.get(key) ?? { date: new Date(s.date), slots: [] };
    entry.slots.push({
      id: s.id,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      maxSeats: s.max_seats,
      seatsLeft,
    });
    buckets.set(key, entry);
  }

  const slotsByDate = Array.from(buckets.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return { classType, slotsByDate };
}

// Atomically reserves a seat by calling the create_pending_booking RPC.
// The function takes a row-lock on the slot, counts active bookings, and
// inserts a PENDING booking row — see the SQL definition in the migration.
export async function createPendingBooking(
  userId: string,
  slotId: string,
): Promise<BookingWithSlot> {
  const admin = getSupabaseAdmin();

  const { data: slot, error: slotErr } = await admin
    .from("class_slots")
    .select("id, class_type:class_type_id(price_fils)")
    .eq("id", slotId)
    .maybeSingle();
  if (slotErr || !slot || !slot.class_type) {
    throw new Error("SLOT_NOT_FOUND");
  }
  const classType = slot.class_type as unknown as { price_fils: number };

  const { data: bookingId, error: rpcErr } = await admin.rpc("create_pending_booking", {
    p_user_id: userId,
    p_slot_id: slotId,
    p_amount_fils: classType.price_fils,
  });
  if (rpcErr) {
    if (rpcErr.message.includes("slot_full")) throw new Error("SLOT_FULL");
    if (rpcErr.message.includes("slot_not_found")) throw new Error("SLOT_NOT_FOUND");
    throw new Error(`createPendingBooking: ${rpcErr.message}`);
  }

  const { data, error } = await admin
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .single();
  if (error || !data) throw new Error("createPendingBooking: post-insert lookup failed");

  return mapBooking(data as unknown as BookingRow);
}

export async function markBookingPaid(bookingId: string, paymentRef: string) {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("bookings")
    .update({
      status: "PAID",
      payment_ref: paymentRef,
      paid_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) throw new Error(`markBookingPaid: ${error.message}`);
}

export async function cancelBooking(bookingId: string) {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("bookings")
    .update({ status: "CANCELLED" })
    .eq("id", bookingId);
  if (error) throw new Error(`cancelBooking: ${error.message}`);
}

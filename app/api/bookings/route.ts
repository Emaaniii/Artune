import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createPendingBooking } from "@/lib/bookings";
import { BookingInput } from "@/lib/validators";
import { buildRedirectUrl } from "@/lib/knet";

export async function POST(req: Request) {
  const user = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BookingInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const booking = await createPendingBooking(user.id, parsed.data.slotId);
    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      redirectUrl: buildRedirectUrl(booking.id),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "BOOKING_FAILED";
    if (msg === "SLOT_FULL") {
      return NextResponse.json({ error: "This slot is full." }, { status: 409 });
    }
    if (msg === "SLOT_NOT_FOUND") {
      return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
}

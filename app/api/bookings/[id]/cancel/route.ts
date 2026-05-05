import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { cancelBooking, getBookingForUser } from "@/lib/bookings";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireUser();
  const booking = await getBookingForUser(params.id, user.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Booking is already cancelled" },
      { status: 409 },
    );
  }

  await cancelBooking(booking.id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createPendingBooking, cancelBooking } from "@/lib/bookings";
import { BookingInput } from "@/lib/validators";
import { getSupabaseServer } from "@/lib/supabase/server";

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

  let bookingId: string | null = null;
  try {
    const booking = await createPendingBooking(user.id, parsed.data.slotId);
    bookingId = booking.id;

    const supabase = getSupabaseServer();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("NO_SESSION");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    const fnRes = await fetch(`${supabaseUrl}/functions/v1/myfatoorah-initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId: booking.id, returnUrl: appUrl }),
      cache: "no-store",
    });
    const fnJson = (await fnRes.json().catch(() => ({}))) as {
      paymentUrl?: string;
      error?: string;
      message?: string;
    };

    if (!fnRes.ok || !fnJson.paymentUrl) {
      // The booking row is already PENDING — release the seat so the user can
      // retry instead of leaving a ghost booking.
      await cancelBooking(booking.id).catch(() => {});
      console.error("myfatoorah-initiate failed", fnRes.status, fnJson);
      return NextResponse.json(
        { error: "Could not start payment.", detail: fnJson.message ?? fnJson.error },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      redirectUrl: fnJson.paymentUrl,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "BOOKING_FAILED";
    if (msg === "SLOT_FULL") {
      return NextResponse.json({ error: "This slot is full." }, { status: 409 });
    }
    if (msg === "SLOT_NOT_FOUND") {
      return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    }
    if (bookingId) {
      await cancelBooking(bookingId).catch(() => {});
    }
    console.error(e);
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
}

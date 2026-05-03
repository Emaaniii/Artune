import { NextResponse } from "next/server";
import { verifyCallback } from "@/lib/knet";
import { cancelBooking, markBookingPaid } from "@/lib/bookings";
import { prisma } from "@/lib/db";

// GET (mock K-Net redirects via <a href>); POST exists too in case a real
// gateway uses form-post callback.
export async function GET(req: Request) {
  return handle(new URL(req.url).searchParams);
}

export async function POST(req: Request) {
  // Real K-Net usually posts URL-encoded form bodies.
  const ctype = req.headers.get("content-type") ?? "";
  let params: URLSearchParams;
  if (ctype.includes("application/x-www-form-urlencoded")) {
    params = new URLSearchParams(await req.text());
  } else {
    const j = (await req.json().catch(() => ({}))) as Record<string, string>;
    params = new URLSearchParams(j);
  }
  return handle(params);
}

async function handle(params: URLSearchParams) {
  const verified = verifyCallback({
    bookingId: params.get("bookingId"),
    result: params.get("result"),
    ts: params.get("ts"),
    sig: params.get("sig"),
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid callback signature." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: verified.bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const base = process.env.APP_URL ?? "http://localhost:3000";

  if (verified.result === "success") {
    if (booking.status !== "PAID") {
      await markBookingPaid(verified.bookingId, `MOCK-${verified.ts}`);
    }
    return NextResponse.redirect(
      `${base}/booking/confirmation/${verified.bookingId}`,
      { status: 303 },
    );
  }

  if (verified.result === "cancelled" || verified.result === "failed") {
    if (booking.status === "PENDING") {
      await cancelBooking(verified.bookingId);
    }
    return NextResponse.redirect(`${base}/booking?cancelled=1`, { status: 303 });
  }

  return NextResponse.json({ error: "Unknown result." }, { status: 400 });
}

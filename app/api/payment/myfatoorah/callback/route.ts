import { NextResponse } from "next/server";
import { cancelBooking, markBookingPaid } from "@/lib/bookings";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPaymentStatus } from "@/lib/myfatoorah";

// MyFatoorah hosted page redirects the customer's browser back here once the
// gateway transaction settles. The URL looks like:
//   /api/payment/myfatoorah/callback?bookingId=<uuid>&paymentId=<id>
// (the gateway also calls the same path with `?bookingId=<uuid>&error=1` if
// the user hit the failure page).
//
// We trust nothing on this URL — we re-verify by hitting v2/GetPaymentStatus
// from the server, then update the booking accordingly.

export async function GET(req: Request) {
  return handle(new URL(req.url).searchParams);
}

export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") ?? "";
  let params: URLSearchParams;
  if (ctype.includes("application/x-www-form-urlencoded")) {
    params = new URLSearchParams(await req.text());
  } else {
    const j = (await req.json().catch(() => ({}))) as Record<string, string>;
    params = new URLSearchParams(j);
  }
  // The body may carry paymentId; bookingId rides on the query string.
  const url = new URL(req.url);
  url.searchParams.forEach((v, k) => params.set(k, v));
  return handle(params);
}

async function handle(params: URLSearchParams) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const bookingId = params.get("bookingId");
  const paymentId = params.get("paymentId");
  const errored = params.get("error") === "1";

  if (!bookingId) {
    return NextResponse.redirect(`${base}/booking?error=missing-booking`, {
      status: 303,
    });
  }

  const admin = getSupabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, status, payment_ref")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) {
    return NextResponse.redirect(`${base}/booking?error=not-found`, {
      status: 303,
    });
  }

  // Already settled — make the callback idempotent.
  if (booking.status === "PAID") {
    return NextResponse.redirect(`${base}/booking/confirmation/${bookingId}`, {
      status: 303,
    });
  }

  if (errored || !paymentId) {
    if (booking.status === "PENDING") await cancelBooking(bookingId);
    return NextResponse.redirect(
      `${base}/booking/confirmation/${bookingId}`,
      { status: 303 },
    );
  }

  const status = await getPaymentStatus(paymentId, "PaymentId");
  if (!status) {
    return NextResponse.redirect(
      `${base}/booking/confirmation/${bookingId}?status=unknown`,
      { status: 303 },
    );
  }

  // Defence-in-depth: only mark this booking paid if MyFatoorah's response
  // references the same booking we're updating.
  const refMatches =
    status.customerReference === bookingId ||
    status.invoiceId === booking.payment_ref;

  if (status.invoiceStatus === "Paid" && refMatches) {
    if (booking.status !== "PAID") {
      await markBookingPaid(bookingId, status.paymentId ?? status.invoiceId);
    }
    return NextResponse.redirect(`${base}/booking/confirmation/${bookingId}`, {
      status: 303,
    });
  }

  if (status.invoiceStatus === "Canceled" || status.invoiceStatus === "Failed") {
    if (booking.status === "PENDING") await cancelBooking(bookingId);
    return NextResponse.redirect(
      `${base}/booking/confirmation/${bookingId}`,
      { status: 303 },
    );
  }

  // Pending / unknown — let the user see the confirmation screen with the
  // current PENDING status; a later webhook or refresh can settle it.
  return NextResponse.redirect(`${base}/booking/confirmation/${bookingId}`, {
    status: 303,
  });
}

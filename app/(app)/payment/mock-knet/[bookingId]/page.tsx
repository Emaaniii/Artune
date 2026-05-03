import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBookingForUser } from "@/lib/bookings";
import { buildCallbackUrl } from "@/lib/knet";
import { formatDate, formatKwd, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MockKnetPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await requireUser();
  const booking = await getBookingForUser(params.bookingId, user.id);
  if (!booking) notFound();

  const successUrl = buildCallbackUrl(booking.id, "success");
  const cancelUrl = buildCallbackUrl(booking.id, "cancelled");

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12">
      <div className="star-glass relative overflow-hidden rounded-2xl p-8">
        <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />

        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">
              K-Net (mock)
            </p>
            <h1 className="font-display text-h2 text-white">Confirm payment</h1>
          </div>
          <span className="rounded-full border border-tertiary/40 bg-tertiary/10 px-3 py-1 text-xs uppercase tracking-widest text-tertiary font-display">
            DEV MODE
          </span>
        </div>

        <dl className="space-y-3 text-sm mb-8">
          <Row label="Class">{booking.slot.classType.name}</Row>
          <Row label="Date">{formatDate(new Date(booking.slot.date))}</Row>
          <Row label="Time">{formatTime(booking.slot.startsAt, booking.slot.endsAt)}</Row>
          <Row label="Booking ID" mono>{booking.id}</Row>
          <Row label="Amount" highlight>{formatKwd(booking.amountFils)}</Row>
        </dl>

        <fieldset className="mb-6 rounded-xl border border-white/10 p-4 opacity-60">
          <legend className="px-2 font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">
            Card (disabled in mock)
          </legend>
          <input
            disabled
            placeholder="•••• •••• •••• 4242"
            className="w-full rounded-lg bg-white/5 px-3 py-2 text-on-surface placeholder:text-slate-600"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              disabled
              placeholder="MM/YY"
              className="rounded-lg bg-white/5 px-3 py-2 text-on-surface placeholder:text-slate-600"
            />
            <input
              disabled
              placeholder="CVV"
              className="rounded-lg bg-white/5 px-3 py-2 text-on-surface placeholder:text-slate-600"
            />
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={cancelUrl}
            className="rounded-xl border border-white/15 px-4 py-3 text-center font-display font-semibold text-on-surface hover:bg-white/5 transition-all"
          >
            Cancel
          </a>
          <a
            href={successUrl}
            className="gradient-button rounded-xl px-4 py-3 text-center font-display font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all"
          >
            Pay {formatKwd(booking.amountFils)}
          </a>
        </div>

        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-on-surface-variant">
          This page simulates the K-Net hosted gateway. Replace with the real redirect in <code className="text-violet-300">lib/knet.ts</code>.
        </p>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
  mono,
  highlight,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd
        className={[
          "text-right",
          mono ? "font-mono text-xs break-all" : "",
          highlight ? "font-display text-lg text-violet-300 font-bold" : "text-on-surface",
        ].join(" ")}
      >
        {children}
      </dd>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBookingForUser } from "@/lib/bookings";
import { formatDate, formatKwd, formatTime } from "@/lib/utils";
import CancelBookingButton from "@/components/CancelBookingButton";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-emerald-400/10 text-emerald-300 border-emerald-400/40",
  PENDING: "bg-tertiary/10 text-tertiary border-tertiary/40",
  CANCELLED: "bg-error/10 text-error border-error/40",
};

export default async function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await requireUser();
  const b = await getBookingForUser(params.bookingId, user.id);
  if (!b) notFound();

  const isPaid = b.status === "PAID";
  const canCancel = b.status === "PENDING" || b.status === "PAID";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="star-glass relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
        <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-3xl">
            {isPaid ? "✦" : "·"}
          </div>
          <h1 className="font-display text-h1 text-white mb-2">
            {isPaid ? "Booking confirmed" : "Booking " + b.status.toLowerCase()}
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-md">
            {isPaid
              ? `Thank you, ${user.name ?? "voyager"}. Your seat is reserved — see you in the studio.`
              : "This booking is not active. You can return to classes and book again."}
          </p>
          <span
            className={`mt-4 inline-block rounded-full border px-3 py-1 text-xs uppercase tracking-widest font-display ${
              STATUS_STYLE[b.status] ?? STATUS_STYLE.PENDING
            }`}
          >
            {b.status}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 mb-8">
          <Field label="Class">{b.slot.classType.name}</Field>
          <Field label="Date">{formatDate(new Date(b.slot.date))}</Field>
          <Field label="Time">{formatTime(b.slot.startsAt, b.slot.endsAt)}</Field>
          <Field label="Amount">{formatKwd(b.amountFils)}</Field>
          <Field label="Booking ID" mono>{b.id}</Field>
          <Field label="Payment ref" mono>{b.paymentRef ?? "—"}</Field>
        </dl>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-on-surface-variant mb-8">
          <p className="font-display font-semibold text-on-surface mb-1">Reminders</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Starters kit will be provided — nothing to bring.</li>
            <li>Wear comfy clothes you don&apos;t mind getting messy.</li>
            <li>Arrive 5 minutes before the start time.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center font-display font-semibold text-on-surface hover:bg-white/5 transition-all"
          >
            Back to dashboard
          </Link>
          {canCancel && <CancelBookingButton bookingId={b.id} />}
          <Link
            href="/booking"
            className="gradient-button flex-1 rounded-xl px-4 py-3 text-center font-display font-bold text-white"
          >
            Book another
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
      <dt className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-xs break-all text-on-surface mt-1" : "text-on-surface mt-1"}>
        {children}
      </dd>
    </div>
  );
}

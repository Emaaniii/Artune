import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBookingForUser } from "@/lib/bookings";
import { formatDate, formatKwd, formatTime } from "@/lib/utils";
import CancelBookingButton from "@/components/CancelBookingButton";

export const dynamic = "force-dynamic";

type Variant = "success" | "failure" | "pending";

function variantFor(status: string): Variant {
  if (status === "PAID") return "success";
  if (status === "CANCELLED") return "failure";
  return "pending";
}

const COPY: Record<
  Variant,
  {
    badge: string;
    icon: string;
    title: (name: string | null) => string;
    body: (name: string | null) => string;
    accent: string; // tailwind colour token used across the screen
    glow: string; // box-shadow tint for the card
    showReminders: boolean;
  }
> = {
  success: {
    badge: "Payment confirmed",
    icon: "✓",
    title: () => "You're booked! ✦",
    body: (name) =>
      `Thank you, ${name ?? "voyager"}. Your seat is reserved — see you in the studio.`,
    accent: "emerald",
    glow: "0_0_60px_rgba(16,185,129,0.18)",
    showReminders: true,
  },
  failure: {
    badge: "Payment not completed",
    icon: "✕",
    title: () => "Payment didn't go through",
    body: () =>
      "No charge was made and your seat has been released. You can try again with the same class or pick a different date.",
    accent: "rose",
    glow: "0_0_60px_rgba(244,63,94,0.18)",
    showReminders: false,
  },
  pending: {
    badge: "Awaiting confirmation",
    icon: "·",
    title: () => "Payment is processing",
    body: () =>
      "We're waiting on the gateway to confirm. Refresh this page in a moment — if it stays pending, the seat will be released automatically.",
    accent: "amber",
    glow: "0_0_60px_rgba(245,158,11,0.18)",
    showReminders: false,
  },
};

const ACCENT_CLASSES: Record<string, { ring: string; bg: string; text: string; pillBorder: string; pillBg: string }> = {
  emerald: {
    ring: "border-emerald-400/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    pillBorder: "border-emerald-400/40",
    pillBg: "bg-emerald-400/10",
  },
  rose: {
    ring: "border-rose-400/40",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    pillBorder: "border-rose-400/40",
    pillBg: "bg-rose-400/10",
  },
  amber: {
    ring: "border-amber-400/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    pillBorder: "border-amber-400/40",
    pillBg: "bg-amber-400/10",
  },
};

export default async function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await requireUser();
  const b = await getBookingForUser(params.bookingId, user.id);
  if (!b) notFound();

  const variant = variantFor(b.status);
  const copy = COPY[variant];
  const styles = ACCENT_CLASSES[copy.accent];
  const canCancel = variant === "success" || variant === "pending";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div
        className={`star-glass relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-[${copy.glow}]`}
      >
        <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border ${styles.ring} ${styles.bg} ${styles.text} text-4xl font-display font-bold`}
          >
            {copy.icon}
          </div>
          <h1 className="font-display text-h1 text-white mb-2">
            {copy.title(user.name)}
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-md">
            {copy.body(user.name)}
          </p>
          <span
            className={`mt-4 inline-block rounded-full border ${styles.pillBorder} ${styles.pillBg} px-3 py-1 text-xs uppercase tracking-widest font-display ${styles.text}`}
          >
            {copy.badge}
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

        {copy.showReminders && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-on-surface-variant mb-8">
            <p className="font-display font-semibold text-on-surface mb-1">Reminders</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Starters kit will be provided — nothing to bring.</li>
              <li>Wear comfy clothes you don&apos;t mind getting messy.</li>
              <li>Arrive 5 minutes before the start time.</li>
            </ul>
          </div>
        )}

        {variant === "failure" ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center font-display font-semibold text-on-surface hover:bg-white/5 transition-all"
            >
              Back to dashboard
            </Link>
            <Link
              href={`/booking/${b.slot.classType.slug}`}
              className="gradient-button flex-1 rounded-xl px-4 py-3 text-center font-display font-bold text-white"
            >
              Try again
            </Link>
          </div>
        ) : (
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
        )}
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

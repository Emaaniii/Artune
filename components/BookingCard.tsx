import Link from "next/link";
import { formatDate, formatKwd, formatTime } from "@/lib/utils";

type Booking = {
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
};

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  PENDING: "bg-tertiary/10 text-tertiary border-tertiary/30",
  CANCELLED: "bg-error/10 text-error border-error/30",
};

export default function BookingCard({ booking }: { booking: Booking }) {
  const s = booking.slot;
  return (
    <Link
      href={`/booking/confirmation/${booking.id}`}
      className="star-glass group relative flex flex-col overflow-hidden rounded-xl transition-all hover:border-violet-500/40"
    >
      <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
      <div className="flex items-center gap-4 p-5">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-700/30 border border-white/10" />
        <div className="flex-grow">
          <h3 className="font-display text-lg font-semibold text-on-surface">
            {s.classType.name}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {formatDate(new Date(s.date))} · {formatTime(s.startsAt, s.endsAt)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{formatKwd(booking.amountFils)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest font-display ${
            STATUS_STYLE[booking.status] ?? STATUS_STYLE.PENDING
          }`}
        >
          {booking.status}
        </span>
      </div>
    </Link>
  );
}

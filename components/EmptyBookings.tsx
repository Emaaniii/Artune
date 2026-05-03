import Link from "next/link";

export default function EmptyBookings() {
  return (
    <div className="star-glass relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-xl p-12 text-center">
      <div className="absolute top-4 right-4 h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
      <div className="relative mb-6 rounded-full border border-primary/20 bg-primary/5 p-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <span className="relative block h-12 w-12 rounded-full bg-gradient-to-br from-violet-300 to-indigo-500" />
      </div>
      <p className="font-display text-h3 text-on-surface mb-2">
        there are no booked classes yet
      </p>
      <p className="font-body-md max-w-md text-on-surface-variant mb-8">
        Your canvas is waiting for its first cosmic stroke. Discover a class and begin your exploration of the arts.
      </p>
      <Link
        href="/booking"
        className="gradient-button rounded-xl px-8 py-4 font-display font-bold tracking-wider text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95"
      >
        Book one
      </Link>
    </div>
  );
}

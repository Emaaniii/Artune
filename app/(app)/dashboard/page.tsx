import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listUserBookings } from "@/lib/bookings";
import EmptyBookings from "@/components/EmptyBookings";
import BookingCard from "@/components/BookingCard";
import SetNameForm from "@/components/SetNameForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const bookings = await listUserBookings(user.id);

  if (!user.name) {
    return (
      <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
        <h1 className="font-display text-h1 text-on-surface mb-4">
          Welcome to <span className="font-bold tracking-[0.15em]">
            <span style={{ color: "#ef4444" }}>A</span>
            <span style={{ color: "#f97316" }}>r</span>
            <span style={{ color: "#fbbf24" }}>t</span>
            <span style={{ color: "#10b981" }}>u</span>
            <span style={{ color: "#3b82f6" }}>n</span>
            <span style={{ color: "#a78bfa" }}>e</span>
          </span>
        </h1>
        <p className="font-body-lg text-on-surface-variant mb-8">
          Tell us your name so we can greet you properly.
        </p>
        <SetNameForm />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
      <header className="mb-12">
        <h1 className="font-display text-h1 text-on-surface">
          Welcome: <span className="text-primary">{user.name}</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mt-2">
          Your creative voyage continues. Explore your upcoming classes or start a new chapter in your artistic journey.
        </p>
      </header>

      <section className="space-y-gutter">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-h2">Booked classes</h2>
          {bookings.length > 0 && (
            <Link
              href="/booking"
              className="font-display text-sm text-violet-300 hover:text-white transition-colors"
            >
              + Book another
            </Link>
          )}
        </div>

        {bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

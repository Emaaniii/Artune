"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (loading) return;
    const ok = window.confirm("Cancel this booking? This cannot be undone.");
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Could not cancel booking. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not cancel booking. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full rounded-xl border border-error/40 bg-error/5 px-4 py-3 text-center font-display font-semibold text-error hover:bg-error/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Cancelling…" : "Cancel booking"}
      </button>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}

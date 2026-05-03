"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { cn, formatKwd, formatTime } from "@/lib/utils";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  seatsLeft: number;
  maxSeats: number;
};

interface Props {
  slots: Slot[];
  priceFils: number;
}

export default function SlotPicker({ slots, priceFils }: Props) {
  const firstAvailable = slots.find((s) => s.seatsLeft > 0)?.id ?? slots[0]?.id ?? "";
  const [slotId, setSlotId] = useState(firstAvailable);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onCheckout() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error ?? "Could not start booking.");
        setLoading(false);
        return;
      }
      router.push(json.redirectUrl);
    } catch {
      setErr("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="font-label-caps text-on-surface-variant uppercase tracking-widest text-xs">
        Select timing
      </p>

      {slots.length === 0 ? (
        <p className="text-on-surface-variant">
          No upcoming sessions. Check back soon ✦
        </p>
      ) : (
        slots.map((s) => {
          const selected = s.id === slotId;
          const sold = s.seatsLeft <= 0;
          return (
            <label
              key={s.id}
              className={cn(
                "relative flex items-center p-4 rounded-xl border cursor-pointer transition-all",
                selected
                  ? "border-violet-400/60 bg-violet-500/10"
                  : "border-white/10 hover:bg-white/5",
                sold && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="radio"
                name="timing"
                className="hidden"
                disabled={sold}
                checked={selected}
                onChange={() => setSlotId(s.id)}
              />
              <div className="flex-1">
                <p className="font-display font-medium text-on-surface">
                  {formatTime(s.startsAt, s.endsAt)}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sold ? "bg-error" : "bg-emerald-400 animate-pulse",
                    )}
                  />
                  <span className={sold ? "text-error" : "text-emerald-400"}>
                    {sold
                      ? "Sold out"
                      : `${s.seatsLeft} of ${s.maxSeats} seats available`}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                  selected
                    ? "border-violet-400 bg-violet-400/20"
                    : "border-white/20",
                )}
              >
                {selected && <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />}
              </div>
            </label>
          );
        })
      )}

      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Class total (1 student)</span>
          <span className="text-on-surface font-semibold">{formatKwd(priceFils)}</span>
        </div>
        {err && (
          <p className="text-sm text-error rounded-lg border border-error/40 bg-error-container/30 px-3 py-2">
            {err}
          </p>
        )}
        <Button
          disabled={!slotId || loading}
          onClick={onCheckout}
          className="w-full py-4 text-lg"
        >
          {loading ? "Reserving…" : "Proceed to payment"}
        </Button>
        <p className="text-[10px] text-center text-on-surface-variant uppercase tracking-widest">
          Secure transaction via K-Net
        </p>
      </div>
    </div>
  );
}

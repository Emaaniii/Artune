"use client";

import { useEffect, useState, useRef } from "react";

type Sparkle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
};

// Artune's letter-palette + warm white. Each sparkle picks one randomly.
const COLORS = [
  "#ef4444", // red — A
  "#f97316", // orange — r
  "#fbbf24", // gold — t
  "#10b981", // emerald — u
  "#3b82f6", // cobalt — n
  "#a78bfa", // violet — e
  "#ffffff", // white accent
];

// Tunables — keep low for performance and not-too-busy visuals.
const SPAWN_INTERVAL_MS = 65; // throttle: at most ~15 sparkles/sec
const LIFETIME_MS = 800;
const MAX_ACTIVE = 25;

/**
 * Mounted client-side via dynamic(ssr:false). Listens to mousemove on the
 * window, drops short-lived sparkle SVGs at the cursor position. No-op on
 * touch devices (mousemove never fires) and on reduced-motion users (CSS
 * animation duration is collapsed to ~0ms by the existing media query in
 * globals.css).
 */
export default function CursorSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return;
      lastSpawnRef.current = now;

      const id = now + Math.random();
      const newSparkle: Sparkle = {
        id,
        // Slight random offset so the trail doesn't sit on a perfect line.
        x: e.clientX + (Math.random() - 0.5) * 14,
        y: e.clientY + (Math.random() - 0.5) * 14,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 6, // 8 – 14 px
        rotation: Math.random() * 360,
      };

      setSparkles((prev) => {
        const next =
          prev.length >= MAX_ACTIVE ? prev.slice(-MAX_ACTIVE + 1) : prev;
        return [...next, newSparkle];
      });

      window.setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, LIFETIME_MS);
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute cursor-sparkle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            color: s.color,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
            <path d="M 12 1 L 13.6 9.4 L 22 12 L 13.6 14.6 L 12 23 L 10.4 14.6 L 2 12 L 10.4 9.4 Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

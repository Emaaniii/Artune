import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

type OrbitProps = {
  rx: string;
  ry: string;
  duration?: string;
  size?: number;
};

// How many trail "ghosts" follow the leader, and how far apart in time each
// one sits on the orbit path. 8 ghosts × 0.16s = 1.28s of trail = ~15% of a
// 9s orbit — enough to read as a comet tail without overwhelming the wordmark.
const TRAIL_COUNT = 8;
const TRAIL_SPACING_S = 0.16;

/**
 * Comet-style orbiter: one bright shining leader, plus a tail of fading
 * ghost stars on the same elliptical path. The ghosts are placed by giving
 * each a negative animation-delay so it sits at the position the leader was
 * (i × spacing) seconds in the past.
 */
export function OrbitingStar({
  rx,
  ry,
  duration = "7s",
  size = 14,
}: OrbitProps) {
  return (
    <>
      {/* Trail ghosts — rendered first so the leader paints on top. */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
        const t = (i + 1) / TRAIL_COUNT; // 0 → 1, head-of-tail to tail-of-tail
        const ghostSize = Math.max(2, size * (1 - t * 0.7));
        const ghostOpacity = Math.max(0.05, 0.65 - t * 0.6);
        const delaySeconds = -(i + 1) * TRAIL_SPACING_S;
        return (
          <OrbitTrailDot
            key={i}
            rx={rx}
            ry={ry}
            duration={duration}
            size={ghostSize}
            opacity={ghostOpacity}
            delay={`${delaySeconds}s`}
          />
        );
      })}
      <OrbitLeader rx={rx} ry={ry} duration={duration} size={size} />
    </>
  );
}

/** The bright shining leader — has halos, rays, and the full sparkle SVG. */
function OrbitLeader({ rx, ry, duration = "7s", size = 14 }: OrbitProps) {
  const half = size / 2;
  return (
    <span
      aria-hidden="true"
      className="orbit-star pointer-events-none absolute top-1/2 left-1/2"
      style={
        {
          "--orbit-rx": rx,
          "--orbit-ry": ry,
          "--orbit-duration": duration,
          marginTop: `-${half}px`,
          marginLeft: `-${half}px`,
          width: `${size}px`,
          height: `${size}px`,
        } as CSSProperties
      }
    >
      {/* Two rippling halos offset in phase — produce a continuous wave of
          light radiating outward from the star. */}
      <span className="orbit-halo orbit-halo-a" />
      <span className="orbit-halo orbit-halo-b" />
      {/* Four short shine rays in a cross pattern, animating outward. */}
      <span className="orbit-rays" />
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="orbit-star-svg"
      >
        <path
          d="M 12 1 L 13.6 9.4 L 22 12 L 13.6 14.6 L 12 23 L 10.4 14.6 L 2 12 L 10.4 9.4 Z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}

/**
 * One ghost particle on the trail. Same orbit path as the leader; lighter
 * styling (no halos, no rays, no twinkle), and a negative animation-delay
 * so it sits behind the leader on the path.
 */
function OrbitTrailDot({
  rx,
  ry,
  duration,
  size,
  opacity,
  delay,
}: OrbitProps & { opacity: number; delay: string }) {
  const half = (size ?? 14) / 2;
  return (
    <span
      aria-hidden="true"
      className="orbit-star pointer-events-none absolute top-1/2 left-1/2"
      style={
        {
          "--orbit-rx": rx,
          "--orbit-ry": ry,
          "--orbit-duration": duration,
          marginTop: `-${half}px`,
          marginLeft: `-${half}px`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: delay,
          opacity,
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="orbit-trail-svg"
      >
        <path
          d="M 12 1 L 13.6 9.4 L 22 12 L 13.6 14.6 L 12 23 L 10.4 14.6 L 2 12 L 10.4 9.4 Z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}

/**
 * Each letter of "Artune" maps to a paint-blob color on the planet.
 * The same colors drive the wordmark, so the link reads visually.
 */
const LETTER_COLORS: ReadonlyArray<{ letter: string; color: string }> = [
  { letter: "A", color: "#ef4444" }, // red
  { letter: "r", color: "#f97316" }, // orange
  { letter: "t", color: "#fbbf24" }, // gold
  { letter: "u", color: "#10b981" }, // emerald
  { letter: "n", color: "#3b82f6" }, // cobalt
  { letter: "e", color: "#a78bfa" }, // violet
];

// Six clock positions, evenly spaced around a 11px-radius circle from (32, 32).
// Order matches LETTER_COLORS so dot-i is letter-i's paint blob.
const BLOB_POSITIONS: ReadonlyArray<{ cx: number; cy: number }> = [
  { cx: 32, cy: 21 }, // 12 o'clock — A
  { cx: 41.5, cy: 26.5 }, // 2 o'clock — r
  { cx: 41.5, cy: 37.5 }, // 4 o'clock — t
  { cx: 32, cy: 43 }, // 6 o'clock — u
  { cx: 22.5, cy: 37.5 }, // 8 o'clock — n
  { cx: 22.5, cy: 26.5 }, // 10 o'clock — e
];

// Saturn-ring endpoints for an ellipse cx=32, cy=34, rx=29, ry=5, rotated -18°
const RING = {
  cyOffset: 34,
  leftX: 4.42,
  leftY: 42.96,
  rightX: 59.58,
  rightY: 25.04,
};

export default function Logo({ size = 48, showWordmark = true, className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Artune logo"
        role="img"
      >
        <defs>
          <radialGradient id="artune-halo" cx="32" cy="32" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c3a8ff" stopOpacity="0.45" />
            <stop offset="0.55" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="artune-planet" cx="0.32" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#475569" />
            <stop offset="0.45" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0a0e1a" />
          </radialGradient>
          <linearGradient id="artune-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c4b5fd" stopOpacity="0" />
            <stop offset="0.25" stopColor="#c4b5fd" stopOpacity="0.85" />
            <stop offset="0.75" stopColor="#a78bfa" stopOpacity="0.85" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft glow halo */}
        <circle cx="32" cy="32" r="30" fill="url(#artune-halo)" />

        {/* Saturn ring — back half (the arc behind the planet) */}
        <path
          d={`M ${RING.leftX} ${RING.leftY} A 29 5 -18 0 1 ${RING.rightX} ${RING.rightY}`}
          stroke="url(#artune-ring)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Planet body (palette base) */}
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="url(#artune-planet)"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="0.5"
        />

        {/* Subtle terminator highlight (light from upper-left) */}
        <path
          d="M 15 25 A 19 19 0 0 1 32 13"
          stroke="#ffffff"
          strokeOpacity="0.18"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Six paint blobs — one per letter of Artune */}
        {LETTER_COLORS.map((c, i) => (
          <circle
            key={c.letter + i}
            cx={BLOB_POSITIONS[i].cx}
            cy={BLOB_POSITIONS[i].cy}
            r="3.5"
            fill={c.color}
            stroke="#0a0e1a"
            strokeOpacity="0.5"
            strokeWidth="0.5"
          />
        ))}

        {/* Tiny shine highlight on each paint blob */}
        {BLOB_POSITIONS.map((p, i) => (
          <circle
            key={`shine-${i}`}
            cx={p.cx - 1}
            cy={p.cy - 1}
            r="0.85"
            fill="#ffffff"
            opacity="0.7"
          />
        ))}

        {/* Saturn ring — front half (the arc in front of the planet) */}
        <path
          d={`M ${RING.leftX} ${RING.leftY} A 29 5 -18 0 0 ${RING.rightX} ${RING.rightY}`}
          stroke="url(#artune-ring)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="relative inline-block">
          <span className="font-display text-2xl font-bold tracking-[0.18em]">
            {LETTER_COLORS.map((c, i) => (
              <span
                key={c.letter + i}
                style={{
                  color: c.color,
                  textShadow: `0 0 12px ${c.color}66`,
                }}
              >
                {c.letter}
              </span>
            ))}
          </span>
          <OrbitingStar rx="68px" ry="14px" duration="7s" size={12} />
        </span>
      )}
    </div>
  );
}

// Pure CSS star field. Lives behind every page (mounted in app/layout.tsx).
// Stars are deterministic (no Math.random at render time) so SSR/CSR match.

const STAR_COLORS = [
  "#ffffff", // white (most common)
  "#ffffff",
  "#e9ddff", // pale violet
  "#c3c0ff", // soft indigo
  "#fde68a", // warm yellow (rare twinkle)
];

const STARS = Array.from({ length: 90 }, (_, i) => {
  // Deterministic pseudo-random from index, kept stable between server + client.
  const seed = (i + 1) * 9301 + 49297;
  const x = (seed % 100) + ((i * 13) % 7);
  const y = ((seed >> 4) % 100) + ((i * 7) % 5);
  const size = (i % 4) + 1; // 1–4 px
  const delay = (i % 9) * 0.55;
  const duration = 3 + (i % 5); // 3–7s — desyncs the twinkle
  const colorIdx = i % 11 === 0 ? 4 : i % STAR_COLORS.length;
  return {
    x: x % 100,
    y: y % 100,
    size,
    delay,
    duration,
    color: STAR_COLORS[colorIdx],
  };
});

type ShootingStar = {
  topPct: number;
  rotateDeg: number;
  widthPx: number;
  durationS: number;
  delayS: number;
  warm?: boolean;
};

// All meteors travel along the same diagonal so the sky reads like one shower.
const SHOOT_ANGLE_DEG = 18;

const SHOOTING: ShootingStar[] = [
  { topPct: 8, rotateDeg: SHOOT_ANGLE_DEG, widthPx: 200, durationS: 16, delayS: 1.2 },
  { topPct: 32, rotateDeg: SHOOT_ANGLE_DEG, widthPx: 160, durationS: 22, delayS: 6, warm: true },
  { topPct: 55, rotateDeg: SHOOT_ANGLE_DEG, widthPx: 240, durationS: 18, delayS: 11 },
  { topPct: 78, rotateDeg: SHOOT_ANGLE_DEG, widthPx: 180, durationS: 20, delayS: 17 },
];

export default function StarField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="nebula-glow top-[-15%] left-[-15%]" />
      <div className="nebula-glow bottom-[-20%] right-[-15%]" />

      {STARS.map((s, i) => {
        const big = s.size >= 3;
        return (
          <span
            key={i}
            className={`absolute rounded-full star-shiny${
              big ? " star-shiny-bright star-sparkle" : ""
            }`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        );
      })}

      {/* Shooting stars — each wrapper is rotated so the trail streaks diagonally */}
      {SHOOTING.map((sh, i) => (
        <div
          key={`shoot-${i}`}
          className="absolute"
          style={{
            top: `${sh.topPct}%`,
            left: 0,
            transform: `rotate(${sh.rotateDeg}deg)`,
            transformOrigin: "left center",
          }}
        >
          <span
            className={`block shooting-trail${sh.warm ? " shooting-trail-warm" : ""}`}
            style={{
              width: `${sh.widthPx}px`,
              animation: `${i % 2 === 0 ? "shoot-1" : "shoot-2"} ${sh.durationS}s linear infinite`,
              animationDelay: `${sh.delayS}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

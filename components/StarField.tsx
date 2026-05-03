// Pure CSS star field. Lives behind every page (mounted in app/layout.tsx).
// Stars are deterministic (no Math.random at render time) so SSR/CSR match.

const STARS = Array.from({ length: 60 }, (_, i) => {
  // Deterministic pseudo-random from index, kept stable between server + client.
  const seed = (i + 1) * 9301 + 49297;
  const x = (seed % 100) + ((i * 13) % 7);
  const y = ((seed >> 4) % 100) + ((i * 7) % 5);
  const size = (i % 3) + 1; // 1–3 px
  const delay = (i % 8) * 0.6;
  return { x: x % 100, y: y % 100, size, delay };
});

export default function StarField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="nebula-glow top-[-15%] left-[-15%]" />
      <div className="nebula-glow bottom-[-20%] right-[-15%]" />

      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            opacity: 0.6,
            boxShadow: s.size > 1 ? "0 0 6px rgba(255,255,255,0.6)" : undefined,
          }}
        />
      ))}

      {/* A single shooting star streaks across periodically */}
      <span
        className="absolute h-[2px] w-32 animate-shooting-star"
        style={{
          top: "18%",
          left: "0",
          background:
            "linear-gradient(90deg, transparent, #d0bcff, rgba(208,188,255,0.8), transparent)",
          boxShadow: "0 0 12px rgba(208,188,255,0.8)",
          animationDelay: "2s",
        }}
      />
      <span
        className="absolute h-[2px] w-24 animate-shooting-star"
        style={{
          top: "62%",
          left: "0",
          background:
            "linear-gradient(90deg, transparent, #c3c0ff, rgba(195,192,255,0.8), transparent)",
          boxShadow: "0 0 10px rgba(195,192,255,0.8)",
          animationDelay: "5.5s",
          animationDuration: "8s",
        }}
      />
    </div>
  );
}

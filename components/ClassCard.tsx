import Link from "next/link";
import type { ClassDisplay } from "@/lib/classes";

export default function ClassCard({ c }: { c: ClassDisplay }) {
  return (
    <Link
      href={`/booking/${c.slug}`}
      className="star-glass group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/40"
    >
      <span className="absolute top-4 right-4 z-10 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
      <div className="relative aspect-square overflow-hidden">
        <ArtworkPlaceholder slug={c.slug} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
      </div>
      <div className="flex flex-col p-6">
        <h3 className="font-display text-h3 mb-2">{c.name}</h3>
        <p className="text-on-surface-variant font-body-md text-sm mb-4">{c.blurb}</p>
        <span className="font-display text-sm text-violet-300 group-hover:text-white transition-colors">
          Choose timing →
        </span>
      </div>
    </Link>
  );
}

// Pure-SVG artwork placeholders so the app renders without external images.
// Replace with proper licensed assets in /public/images/<slug>.jpg later.
function ArtworkPlaceholder({ slug }: { slug: string }) {
  switch (slug) {
    case "oil-painting":
      return <StarryNight />;
    case "manga":
      return <SailorMoonish />;
    case "miniature":
      return <HobbitHole />;
    case "sculpting":
      return <MarbleBust />;
    default:
      return null;
  }
}

function StarryNight() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="sn-sky" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0b1326" />
        </radialGradient>
        <radialGradient id="sn-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#sn-sky)" />
      {/* swirls */}
      <path d="M0 130 C 80 60, 200 200, 400 100" stroke="#a5b4fc" strokeWidth="14" fill="none" opacity="0.5" />
      <path d="M0 180 C 120 100, 240 260, 400 160" stroke="#818cf8" strokeWidth="10" fill="none" opacity="0.55" />
      <path d="M0 230 C 100 170, 260 300, 400 220" stroke="#6366f1" strokeWidth="8" fill="none" opacity="0.5" />
      {/* moon */}
      <circle cx="310" cy="100" r="32" fill="url(#sn-moon)" />
      {/* stars */}
      {[
        [60, 80, 12], [140, 60, 16], [240, 110, 10], [80, 200, 8], [200, 80, 14],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r as number} fill="#fde68a" opacity="0.85" />
      ))}
      {/* village */}
      <rect x="0" y="320" width="400" height="80" fill="#0f172a" />
      <polygon points="60,320 100,280 140,320" fill="#1e293b" />
      <polygon points="160,320 200,290 240,320" fill="#1e293b" />
      <polygon points="260,320 300,275 340,320" fill="#1e293b" />
      <rect x="195" y="305" width="6" height="10" fill="#fde68a" />
    </svg>
  );
}

function SailorMoonish() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <radialGradient id="sm-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fbbf24" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#sm-bg)" />
      {[
        [40, 50, 1.5], [120, 30, 2], [220, 70, 1.5], [330, 40, 2.5], [80, 120, 1],
        [300, 130, 1.5], [200, 200, 1], [60, 260, 1.5], [340, 240, 2], [180, 320, 1.2],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r as number} fill="white" opacity="0.85" />
      ))}
      {/* crescent moon */}
      <circle cx="280" cy="100" r="48" fill="url(#sm-moon)" />
      <circle cx="296" cy="92" r="48" fill="#312e81" />
      {/* stylized character silhouette */}
      <ellipse cx="180" cy="260" rx="60" ry="40" fill="#c4b5fd" opacity="0.9" />
      <circle cx="180" cy="200" r="42" fill="#fde68a" />
      {/* twin tails */}
      <path d="M150 200 Q 110 240 130 320 L 145 320 Q 145 250 175 220 Z" fill="#fbbf24" opacity="0.95" />
      <path d="M210 200 Q 250 240 230 320 L 215 320 Q 215 250 185 220 Z" fill="#fbbf24" opacity="0.95" />
      {/* tiara */}
      <path d="M158 188 L 180 175 L 202 188 Z" fill="#facc15" />
      {/* sparkles */}
      <text x="100" y="180" fill="#fde68a" fontSize="20">✦</text>
      <text x="290" y="280" fill="#fbcfe8" fontSize="18">✦</text>
    </svg>
  );
}

function HobbitHole() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <radialGradient id="hh-hill" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#14532d" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#hh-sky)" />
      {[[60, 60], [200, 40], [320, 80], [120, 110], [280, 130]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.8" />
      ))}
      {/* hill */}
      <ellipse cx="200" cy="320" rx="280" ry="140" fill="url(#hh-hill)" />
      {/* round door */}
      <circle cx="200" cy="280" r="55" fill="#0d9488" />
      <circle cx="200" cy="280" r="55" fill="none" stroke="#fcd34d" strokeWidth="3" />
      <circle cx="222" cy="280" r="3" fill="#fcd34d" />
      <line x1="200" y1="225" x2="200" y2="335" stroke="#0f766e" strokeWidth="1.5" opacity="0.6" />
      {/* lantern glow */}
      <circle cx="140" cy="300" r="8" fill="#fde68a" opacity="0.85" />
      <circle cx="260" cy="300" r="8" fill="#fde68a" opacity="0.85" />
      {/* tiny window above door */}
      <circle cx="200" cy="225" r="10" fill="#fef3c7" opacity="0.9" />
    </svg>
  );
}

function MarbleBust() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="mb-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="1" stopColor="#0b1326" />
        </radialGradient>
        <linearGradient id="mb-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#mb-bg)" />
      {[[50, 60], [320, 90], [80, 320], [340, 280], [200, 50]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#c4b5fd" opacity="0.7" />
      ))}
      {/* pedestal */}
      <rect x="140" y="320" width="120" height="40" fill="#1e293b" />
      {/* shoulders */}
      <path d="M 110 320 Q 200 240 290 320 Z" fill="url(#mb-stone)" />
      {/* head */}
      <ellipse cx="200" cy="200" rx="55" ry="65" fill="url(#mb-stone)" />
      {/* hair waves */}
      <path d="M 145 180 Q 200 130 255 180 Q 230 160 200 165 Q 170 160 145 180 Z" fill="#94a3b8" />
      <path d="M 150 165 Q 200 110 250 165 Q 220 145 200 150 Q 180 145 150 165 Z" fill="#cbd5e1" />
      {/* eye / nose hint */}
      <line x1="200" y1="195" x2="200" y2="225" stroke="#64748b" strokeWidth="2" />
      <ellipse cx="180" cy="205" rx="3" ry="2" fill="#475569" />
      <ellipse cx="220" cy="205" rx="3" ry="2" fill="#475569" />
      <path d="M 188 240 Q 200 248 212 240" stroke="#475569" strokeWidth="2" fill="none" />
    </svg>
  );
}

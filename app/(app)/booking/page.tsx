import ClassCard from "@/components/ClassCard";
import { CLASS_DISPLAY, CLASS_SLUGS } from "@/lib/classes";

export default function BookingPage() {
  return (
    <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
      <header className="relative mb-12 text-center">
        {/* Wide-orbit ornaments: brushes, palette, color tubes */}
        <FloatingDeco />

        {/* Heading + sparkle cluster glued to it */}
        <div className="relative inline-block">
          <SparkleCluster />
          <h1
            className="relative z-10 inline-block font-display text-h1 md:text-[56px] font-bold tracking-tight text-on-surface mb-4
              [text-shadow:_0_0_18px_rgba(255,255,255,0.75),_0_0_36px_rgba(233,221,255,0.6),_0_0_72px_rgba(167,139,250,0.5),_0_0_120px_rgba(139,92,246,0.4)]
              before:content-[''] before:pointer-events-none before:absolute before:left-1/2 before:top-1/2 before:-z-10
              before:h-[260%] before:w-[200%] before:-translate-x-1/2 before:-translate-y-1/2
              before:rounded-full before:blur-3xl
              before:bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.55)_0%,rgba(139,92,246,0.3)_30%,rgba(99,102,241,0.15)_55%,transparent_78%)]
              after:content-[''] after:pointer-events-none after:absolute after:left-1/2 after:top-1/2 after:-z-10
              after:h-[150%] after:w-[125%] after:-translate-x-1/2 after:-translate-y-1/2
              after:rounded-full after:blur-2xl
              after:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(233,221,255,0.5)_22%,rgba(208,188,255,0.3)_45%,rgba(167,139,250,0.12)_65%,transparent_80%)]"
          >
            Discover your Abilities
          </h1>
        </div>

        <p className="relative z-10 font-body-lg max-w-2xl mx-auto text-on-surface-variant">
          Pick the universe of expression you want to explore today. Two timings per evening, ten seats per class.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-gutter md:grid-cols-2">
        {CLASS_SLUGS.map((slug) => (
          <ClassCard key={slug} c={CLASS_DISPLAY[slug]} />
        ))}
      </div>
    </main>
  );
}

/**
 * Wider-orbit ornaments — paintbrushes, palette, and color tubes — bobbing
 * out at the corners of the heading area. Hidden on mobile.
 */
function FloatingDeco() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <span className="absolute left-[8%] top-2 float-a">
        <Paintbrush variant="a" />
      </span>
      <span className="absolute right-[10%] top-0 float-b">
        <Palette />
      </span>
      <span className="absolute left-[14%] bottom-1 float-c">
        <ColorTube color="red" />
      </span>
      <span className="absolute right-[16%] bottom-4 float-d">
        <ColorTube color="yellow" />
      </span>
      <span className="absolute left-[36%] -bottom-2 float-a">
        <ColorTube color="cyan" />
      </span>
      <span className="absolute right-[36%] top-4 float-c">
        <Paintbrush variant="b" />
      </span>
    </div>
  );
}

/**
 * Tight sparkle cluster sitting on the edges of the heading — bright accents
 * that hug the words rather than orbit the whole header.
 */
function SparkleCluster() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -left-7 -top-2 z-20 float-b">
        <Sparkle size="md" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute -right-7 -top-3 z-20 float-c">
        <Sparkle size="lg" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 z-20 float-d">
        <Sparkle size="xs" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 z-20 float-a">
        <Sparkle size="sm" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute left-2 -bottom-2 z-20 float-c">
        <Sparkle size="xs" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute right-4 -bottom-3 z-20 float-b">
        <Sparkle size="md" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 -top-5 -translate-x-1/2 z-20 float-a">
        <Sparkle size="sm" />
      </span>
    </>
  );
}

/* ----------------------------------------------------------------------- */
/*                          SVG decoration components                       */
/* ----------------------------------------------------------------------- */

function Paintbrush({ variant }: { variant: "a" | "b" }) {
  // Tilt: variant A leans left, variant B leans right
  const tilt = variant === "a" ? -28 : 28;

  // Outline / ink colors
  const ink = "#0a0e1a";
  const inkSoft = "#1f2937";

  // Dark glossy wood handle
  const handle = "#5a3a1f";
  const handleHighlight = "#a06d3d";
  const handleShine = "#d09864";
  const handleShadow = "#3d2210";

  // Dark metallic ferrule
  const ferrule = "#3f4756";
  const ferruleStreak = "#9ca3af";
  const ferruleShine = "#e5e7eb";

  // Yellow bristles with warm highlights
  const bristle = "#fbbf24";
  const bristleHighlight = "#fde68a";
  const bristleShine = "#fffbeb";
  const bristleStrand = "#92400e"; // warm dark brown that shows on yellow

  // Variant accent — paint splatter color (this brush has been used)
  const splatter = variant === "a" ? "#fbbf24" : "#a78bfa";
  const splatterShine = variant === "a" ? "#fef3c7" : "#ede9fe";

  return (
    <svg
      viewBox="0 0 88 96"
      className="h-14 w-14 md:h-16 md:w-16 drop-shadow-[0_0_12px_rgba(208,188,255,0.55)]"
    >
      <g transform={`rotate(${tilt} 44 48)`}>
        {/* Soft drop-shadow under the bristles */}
        <ellipse cx="44" cy="89" rx="11" ry="1.8" fill={ink} opacity="0.18" />

        {/* ── Dark wooden handle: tapered to a soft point at top ── */}
        <path
          d="M 36 44
             L 52 44
             Q 53 36 53 26
             Q 53 14 50 7
             Q 47 3 44 3
             Q 41 3 38 7
             Q 35 14 35 26
             Q 35 36 36 44 Z"
          fill={handle}
          stroke={ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* primary glossy highlight stripe (left of center) */}
        <path
          d="M 38 42
             Q 38 30 39 18
             Q 40 10 42 6
             Q 41 12 41 22
             Q 41 34 41 42 Z"
          fill={handleHighlight}
          opacity="0.95"
        />
        {/* secondary brighter sheen — narrow catch-light */}
        <path
          d="M 40 40
             Q 40 28 41 16
             L 42 14
             Q 42 26 42 40 Z"
          fill={handleShine}
          opacity="0.85"
        />
        {/* darker shadow on the right side */}
        <path
          d="M 49 40
             Q 50 28 49 14
             Q 49 14 49 14
             L 47 16
             Q 48 28 47 40 Z"
          fill={handleShadow}
          opacity="0.55"
        />
        {/* small bottom curve at handle-ferrule junction (subtle ridge) */}
        <path
          d="M 36 43 Q 44 45 52 43"
          stroke={ink}
          strokeWidth="0.7"
          fill="none"
          opacity="0.5"
        />

        {/* ── Dark metallic ferrule (two-band style) ── */}
        <rect
          x="33"
          y="44"
          width="22"
          height="13"
          rx="0.8"
          fill={ferrule}
          stroke={ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* bright vertical metallic streak (the main "shine") */}
        <rect x="36" y="45" width="1.3" height="11" fill={ferruleShine} opacity="0.95" />
        {/* secondary streaks */}
        <line x1="38" y1="45" x2="38" y2="56" stroke={ferruleStreak} strokeWidth="0.7" opacity="0.8" />
        <line x1="42" y1="45" x2="42" y2="56" stroke={ferruleStreak} strokeWidth="0.5" opacity="0.55" />
        <line x1="47" y1="45" x2="47" y2="56" stroke={ferruleStreak} strokeWidth="0.5" opacity="0.55" />
        <line x1="51" y1="45" x2="51" y2="56" stroke={ferruleStreak} strokeWidth="0.5" opacity="0.55" />
        {/* horizontal divider — splits the ferrule into two bands */}
        <line x1="33" y1="50.5" x2="55" y2="50.5" stroke={ink} strokeWidth="1" opacity="0.7" />
        {/* tiny top + bottom edge highlight on each band */}
        <rect x="34" y="44.6" width="20" height="0.8" fill={ferruleShine} opacity="0.6" />

        {/* ── Yellow bristles: clean rounded teardrop, soft tapered tip ── */}
        <path
          d="M 33 57
             C 28 65 26 75 32 83
             C 36 86 42 87 45 85
             C 51 80 54 67 55 57
             Z"
          fill={bristle}
          stroke={ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* main bristle highlight — lighter yellow on the left */}
        <path
          d="M 35 60
             C 31 67 30 76 35 82
             C 36 75 36 67 36 60 Z"
          fill={bristleHighlight}
          opacity="0.85"
        />
        {/* glossy catch-light streak — wet paint sheen */}
        <ellipse
          cx="37"
          cy="69"
          rx="1.6"
          ry="4"
          fill={bristleShine}
          opacity="0.95"
          transform="rotate(-8 37 69)"
        />
        {/* secondary smaller catch-light */}
        <ellipse
          cx="46"
          cy="66"
          rx="0.9"
          ry="2.2"
          fill={bristleShine}
          opacity="0.7"
          transform="rotate(20 46 66)"
        />
        {/* tiny tip glint */}
        <ellipse cx="40" cy="83" rx="0.7" ry="0.5" fill={bristleShine} opacity="0.7" />
        {/* hand-drawn dark strand lines through the bristles */}
        <g stroke={bristleStrand} strokeWidth="0.85" fill="none" strokeLinecap="round" opacity="0.95">
          <path d="M 33 60 C 30 67 29 75 33 82" />
          <path d="M 39 60 C 37 67 36 75 38 83" />
          <path d="M 45 60 C 45 67 44 75 43 82" />
          <path d="M 51 60 C 51 66 51 72 49 78" />
        </g>
        {/* tiny "fluff" tick marks where bristles meet the ferrule */}
        <path
          d="M 34 58 Q 34.5 59 35 58"
          stroke={ink}
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 53 58 Q 53.5 59 54 58"
          stroke={ink}
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Paint splatter dots in the variant accent color ── */}
        <g>
          <circle cx="14" cy="80" r="1.5" fill={splatter} stroke={ink} strokeWidth="0.6" />
          <ellipse cx="13.4" cy="79.3" rx="0.5" ry="0.3" fill={splatterShine} opacity="0.85" />
          <circle cx="10" cy="73" r="0.9" fill={splatter} stroke={ink} strokeWidth="0.5" />
          <circle cx="65" cy="74" r="1.1" fill={splatter} stroke={ink} strokeWidth="0.55" />
          <ellipse cx="64.5" cy="73.4" rx="0.35" ry="0.25" fill={splatterShine} opacity="0.7" />
          <circle cx="68" cy="82" r="0.6" fill={splatter} stroke={ink} strokeWidth="0.4" />
        </g>
      </g>
    </svg>
  );
}

function Palette() {
  return (
    <svg
      viewBox="0 0 56 56"
      className="h-12 w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(208,188,255,0.55)]"
    >
      {/* palette body — kidney-bean shape */}
      <path
        d="M 28 6
           C 42 6 50 16 50 26
           C 50 32 44 35 39 33
           C 35 31.5 32 34 33 38
           C 34.5 44 30 50 24 50
           C 12 50 6 38 6 26
           C 6 14 14 6 28 6 Z"
        fill="#f3e8d6"
        stroke="#a78bfa"
        strokeWidth="1"
      />
      {/* thumb hole */}
      <ellipse cx="38" cy="26" rx="3.2" ry="3.8" fill="#0b1326" />
      {/* paint blobs */}
      <circle cx="16" cy="18" r="3.2" fill="#ef4444" />
      <circle cx="25" cy="14" r="3.2" fill="#fbbf24" />
      <circle cx="14" cy="30" r="3.2" fill="#10b981" />
      <circle cx="22" cy="40" r="3" fill="#3b82f6" />
      <circle cx="32" cy="42" r="2.6" fill="#d0bcff" />
      {/* tiny shine highlight on the palette wood */}
      <ellipse cx="14" cy="14" rx="2" ry="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function ColorTube({ color }: { color: "red" | "yellow" | "cyan" }) {
  const palette = {
    red: { dark: "#b91c1c", base: "#ef4444", light: "#fca5a5" },
    yellow: { dark: "#b45309", base: "#fbbf24", light: "#fde68a" },
    cyan: { dark: "#0e7490", base: "#06b6d4", light: "#67e8f9" },
  }[color];
  const tilt = color === "red" ? -18 : color === "yellow" ? 24 : -38;
  const id = color;
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(208,188,255,0.55)]"
    >
      <defs>
        <linearGradient id={`tube-body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={`tube-cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="0.45" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={`tube-paint-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.light} />
          <stop offset="0.4" stopColor={palette.base} />
          <stop offset="1" stopColor={palette.dark} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${tilt} 32 32)`}>
        {/* Crimped (folded/zig-zagged) back of the tube */}
        <path
          d="M 4 22
             L 9 25 L 4 28 L 9 31 L 4 34 L 9 37 L 4 40 L 9 43 L 4 46 Z"
          fill={`url(#tube-body-${id})`}
          stroke="#64748b"
          strokeWidth="0.5"
        />
        {/* tiny shadow line on the crimp */}
        <line x1="9" y1="22" x2="9" y2="46" stroke="#475569" strokeWidth="0.4" opacity="0.6" />

        {/* Main tube body — slightly tapered toward the neck */}
        <path
          d="M 9 22
             L 46 24
             L 46 44
             L 9 46 Z"
          fill={`url(#tube-body-${id})`}
          stroke="#94a3b8"
          strokeWidth="0.5"
        />

        {/* Paint colour label — wraps most of the tube */}
        <path
          d="M 12 25
             L 42 26.5
             L 42 41.5
             L 12 43 Z"
          fill={`url(#tube-paint-${id})`}
        />
        {/* darker stripe at top of label */}
        <path
          d="M 12 25
             L 42 26.5
             L 42 28
             L 12 26.5 Z"
          fill="#000000"
          opacity="0.22"
        />
        {/* darker stripe at bottom of label */}
        <path
          d="M 12 41
             L 42 39.5
             L 42 41.5
             L 12 43 Z"
          fill="#000000"
          opacity="0.22"
        />
        {/* white star marker on the label */}
        <path
          d="M 17 34 L 17.6 35.6 L 19.3 35.7 L 18 36.8 L 18.4 38.4 L 17 37.5 L 15.6 38.4 L 16 36.8 L 14.7 35.7 L 16.4 35.6 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* "OIL" text on label */}
        <text
          x="22"
          y="36.5"
          fontSize="5.5"
          fontWeight="bold"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill="#ffffff"
          opacity="0.9"
        >
          OIL
        </text>

        {/* Glossy highlight strip down the body */}
        <path
          d="M 10 23
             L 45 24.5
             L 45 26
             L 10 24.5 Z"
          fill="#ffffff"
          opacity="0.6"
        />

        {/* Threaded neck — multiple ridge lines */}
        <rect x="46" y="27" width="6" height="14" fill={`url(#tube-body-${id})`} />
        {[28, 30, 32, 34, 36, 38, 40].map((y) => (
          <line
            key={y}
            x1="46.5"
            y1={y}
            x2="51.5"
            y2={y}
            stroke="#475569"
            strokeWidth="0.5"
            opacity="0.65"
          />
        ))}

        {/* Screw cap with knurled (ridged) texture */}
        <rect
          x="52"
          y="24"
          width="9"
          height="20"
          rx="1.8"
          fill={`url(#tube-cap-${id})`}
          stroke="#0f172a"
          strokeWidth="0.4"
        />
        {/* knurl ridges */}
        {[53.4, 55, 56.6, 58.2, 59.8].map((x) => (
          <line
            key={x}
            x1={x}
            y1="25.5"
            x2={x}
            y2="42.5"
            stroke="#0f172a"
            strokeWidth="0.5"
            opacity="0.7"
          />
        ))}
        {/* cap top highlight */}
        <rect x="52.6" y="24.6" width="7.6" height="1.3" rx="0.5" fill="#94a3b8" opacity="0.7" />
      </g>
    </svg>
  );
}

function Sparkle({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" }) {
  const cls =
    size === "xs"
      ? "h-2.5 w-2.5"
      : size === "sm"
        ? "h-4 w-4"
        : size === "lg"
          ? "h-6 w-6 md:h-7 md:w-7"
          : "h-5 w-5";
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${cls} drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]`}
    >
      <path
        d="M 12 1 L 13.6 9.4 L 22 12 L 13.6 14.6 L 12 23 L 10.4 14.6 L 2 12 L 10.4 9.4 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

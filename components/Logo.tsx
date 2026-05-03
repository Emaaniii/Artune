import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 48, showWordmark = true, className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arting logo"
        role="img"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d0bcff" />
            <stop offset="1" stopColor="#6d3bd7" />
          </linearGradient>
          <radialGradient id="logo-glow" cx="32" cy="32" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a078ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#a078ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft glow */}
        <circle cx="32" cy="32" r="28" fill="url(#logo-glow)" />

        {/* Palette body */}
        <path
          d="M32 8c-13 0-24 9.5-24 22 0 7 6 12 13 12 3 0 5-1.5 5-4 0-1.5-1-2.5-1-4 0-2.5 2-4 4.5-4H38c10 0 18-7 18-15 0-4-3-7-10-7Z"
          fill="url(#logo-grad)"
          opacity="0.95"
        />

        {/* Palette dots (paint blobs) */}
        <circle cx="20" cy="26" r="2.4" fill="#0b1326" />
        <circle cx="28" cy="20" r="2.4" fill="#0b1326" />
        <circle cx="38" cy="20" r="2.4" fill="#0b1326" />
        <circle cx="46" cy="26" r="2.4" fill="#0b1326" />

        {/* Brush handle (diagonal) */}
        <rect
          x="36"
          y="36"
          width="4.5"
          height="22"
          rx="1.5"
          transform="rotate(-30 36 36)"
          fill="#e9ddff"
        />
        {/* Brush ferrule */}
        <rect
          x="33.5"
          y="34"
          width="6"
          height="4"
          transform="rotate(-30 33.5 34)"
          fill="#958ea0"
        />
        {/* Brush bristles */}
        <path
          d="M30.6 31 L36.5 28 L37.6 32 L31.7 35 Z"
          fill="#c3c0ff"
        />
      </svg>
      {showWordmark && (
        <span className="font-display text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
          Arting
        </span>
      )}
    </div>
  );
}

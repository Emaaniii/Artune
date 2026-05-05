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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.imageUrl}
          alt={c.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-80 pointer-events-none" />
      </div>
      <div className="flex flex-col p-5">
        <h3 className="font-display text-xl font-semibold mb-1.5">{c.name}</h3>
        <p className="text-on-surface-variant font-body-md text-[13px] leading-relaxed mb-3">{c.blurb}</p>
        <span className="font-display text-xs text-violet-300 group-hover:text-white transition-colors">
          Choose timing →
        </span>
      </div>
    </Link>
  );
}

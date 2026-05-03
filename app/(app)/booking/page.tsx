import ClassCard from "@/components/ClassCard";
import { CLASS_DISPLAY, CLASS_SLUGS } from "@/lib/classes";

export default function BookingPage() {
  return (
    <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
      <header className="mb-12 text-center">
        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-label-caps tracking-widest text-[10px] uppercase">
          Choose your creative orbit
        </div>
        <h1 className="font-display text-h1 text-on-surface mb-4">
          Discover new artistic constellations
        </h1>
        <p className="font-body-lg max-w-2xl mx-auto text-on-surface-variant">
          Pick the universe of expression you want to explore today. Two timings per evening, ten seats per class.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {CLASS_SLUGS.map((slug) => (
          <ClassCard key={slug} c={CLASS_DISPLAY[slug]} />
        ))}
      </div>
    </main>
  );
}

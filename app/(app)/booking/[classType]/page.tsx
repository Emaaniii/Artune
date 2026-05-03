import { notFound } from "next/navigation";
import { CLASS_DISPLAY, isClassSlug } from "@/lib/classes";
import { getNextSlotsForClass, seatsAvailable } from "@/lib/bookings";
import SlotPicker from "@/components/SlotPicker";
import { formatDate, formatKwd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: { classType: string };
}) {
  if (!isClassSlug(params.classType)) notFound();

  const display = CLASS_DISPLAY[params.classType];
  const data = await getNextSlotsForClass(params.classType);
  if (!data) notFound();

  const { classType, slots: rawSlots } = data;
  const slots = await Promise.all(
    rawSlots.map(async (s) => ({
      id: s.id,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      maxSeats: s.maxSeats,
      seatsLeft: await seatsAvailable(s.id),
    })),
  );

  const sessionDate = rawSlots[0]?.date ? new Date(rawSlots[0].date) : null;

  return (
    <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 mb-4 font-label-caps text-violet-300 uppercase tracking-widest text-xs">
          ✦ Creative workshop
        </div>
        <h1 className="font-display text-h1 text-on-surface mb-3">{classType.name}</h1>
        <p className="text-on-surface-variant font-body-lg max-w-2xl">{display.blurb}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: artwork + essentials */}
        <div className="md:col-span-7 flex flex-col gap-8">
          <div className="star-glass relative overflow-hidden rounded-2xl aspect-video">
            {/* Inline placeholder uses the same SVG family as the picker */}
            <ClassPreview slug={params.classType} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          </div>

          <div className="star-glass rounded-2xl p-8 relative">
            <div className="absolute top-4 right-4 h-1 w-1 rounded-full bg-violet-400" />
            <h2 className="font-display text-h3 mb-6">Class essentials</h2>
            <div className="space-y-5">
              <Essential title="Starters kit provided">
                Everything you need is already waiting at your station — nothing to bring.
              </Essential>
              <Essential title="Wear comfy clothes">
                Creativity can be wild. Dress comfortably — it might get messy with paints, clay or pigments.
              </Essential>
              <Essential title="20 KWD per student">
                Pay securely via K-Net at checkout.
              </Essential>
            </div>
          </div>
        </div>

        {/* Right: booking widget */}
        <aside className="md:col-span-5">
          <div className="star-glass sticky top-28 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-display text-h2 text-on-surface">Book your seat</h2>
                {sessionDate && (
                  <p className="text-sm text-on-surface-variant mt-1">
                    {formatDate(sessionDate)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant text-xs font-label-caps">Price</p>
                <p className="text-2xl font-display font-bold text-violet-300">
                  {formatKwd(classType.priceFils)}
                </p>
                <p className="text-xs text-on-surface-variant">per student</p>
              </div>
            </div>
            <SlotPicker slots={slots} priceFils={classType.priceFils} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Essential({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 font-display text-violet-300 text-sm shrink-0">
        ✦
      </div>
      <div>
        <p className="font-body-md text-on-surface font-semibold">{title}</p>
        <p className="text-sm text-on-surface-variant">{children}</p>
      </div>
    </div>
  );
}

function ClassPreview({ slug }: { slug: string }) {
  // Re-use the same SVGs from the picker by lazy-importing.
  // Inline tiny copy here to keep the server component clean.
  const palette: Record<string, [string, string]> = {
    "oil-painting": ["#1e3a8a", "#fbbf24"],
    manga: ["#312e81", "#fbcfe8"],
    miniature: ["#0f766e", "#fde68a"],
    sculpting: ["#1e293b", "#e5e7eb"],
  };
  const [a, b] = palette[slug] ?? ["#312e81", "#d0bcff"];
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`prev-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor="#0b1326" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#prev-${slug})`} />
      {[...Array(40)].map((_, i) => (
        <circle
          key={i}
          cx={(i * 53) % 800}
          cy={(i * 97) % 450}
          r={(i % 3) + 1}
          fill="white"
          opacity={0.4 + ((i % 5) / 10)}
        />
      ))}
      <circle cx="600" cy="120" r="60" fill={b} opacity="0.85" />
    </svg>
  );
}

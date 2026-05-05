import { notFound } from "next/navigation";
import { CLASS_DISPLAY, isClassSlug } from "@/lib/classes";
import { getUpcomingSlotsForClass } from "@/lib/bookings";
import SlotPicker from "@/components/SlotPicker";
import { formatKwd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: { classType: string };
}) {
  if (!isClassSlug(params.classType)) notFound();

  const display = CLASS_DISPLAY[params.classType];
  const data = await getUpcomingSlotsForClass(params.classType);
  if (!data) notFound();

  const { classType, slotsByDate } = data;
  const slotsByDateSerialized = slotsByDate.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    slots: b.slots,
  }));

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={display.imageUrl}
              alt={classType.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
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
                <p className="text-sm text-on-surface-variant mt-1">
                  Pick a date and timing that works for you.
                </p>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant text-xs font-label-caps">Price</p>
                <p className="text-2xl font-display font-bold text-violet-300">
                  {formatKwd(classType.priceFils)}
                </p>
                <p className="text-xs text-on-surface-variant">per student</p>
              </div>
            </div>
            <SlotPicker slotsByDate={slotsByDateSerialized} priceFils={classType.priceFils} />
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


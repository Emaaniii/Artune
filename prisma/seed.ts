import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLASSES = [
  {
    slug: "oil-painting",
    name: "Oil Painting",
    blurb:
      "Master expressive impasto strokes inspired by Van Gogh's Starry Night.",
    imageUrl: "/images/oil-painting.jpg",
    priceFils: 20000,
  },
  {
    slug: "manga",
    name: "Manga Drawing",
    blurb:
      "Capture the magical-girl aesthetic — clean linework and celestial shading.",
    imageUrl: "/images/manga.jpg",
    priceFils: 20000,
  },
  {
    slug: "miniature",
    name: "Miniature Designing",
    blurb:
      "Build tiny worlds — a Hobbit hillside in the palm of your hand.",
    imageUrl: "/images/miniature.jpg",
    priceFils: 20000,
  },
  {
    slug: "sculpting",
    name: "Sculpting",
    blurb:
      "Shape volume from material — classical form meets cosmic geometry.",
    imageUrl: "/images/sculpting.jpg",
    priceFils: 20000,
  },
];

const TIMINGS = [
  { startsAt: "18:00", endsAt: "19:00" },
  { startsAt: "19:00", endsAt: "20:00" },
];

function startOfTomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  for (const c of CLASSES) {
    await prisma.classType.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, blurb: c.blurb, imageUrl: c.imageUrl, priceFils: c.priceFils },
    });
  }

  const types = await prisma.classType.findMany();
  const start = startOfTomorrow();

  // Generate slots for the next 30 days, both timings, every class.
  for (let i = 0; i < 30; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    for (const t of types) {
      for (const time of TIMINGS) {
        await prisma.classSlot.upsert({
          where: {
            classTypeId_date_startsAt: {
              classTypeId: t.id,
              date,
              startsAt: time.startsAt,
            },
          },
          create: {
            classTypeId: t.id,
            date,
            startsAt: time.startsAt,
            endsAt: time.endsAt,
            maxSeats: 10,
          },
          update: {},
        });
      }
    }
  }

  console.log(`Seeded ${CLASSES.length} classes and 30 days of slots.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

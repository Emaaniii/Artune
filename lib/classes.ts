// Static class metadata. The DB owns the source of truth (priceFils, blurb,
// imageUrl come from the `ClassType` rows seeded by prisma/seed.ts), but this
// constant is used for routing / icons / fallback rendering on the
// client-side class picker.

export const CLASS_SLUGS = ["oil-painting", "manga", "miniature", "sculpting"] as const;
export type ClassSlug = (typeof CLASS_SLUGS)[number];

export interface ClassDisplay {
  slug: ClassSlug;
  name: string;
  blurb: string;
  imageUrl: string;
  icon: string; // material symbol name
}

export const CLASS_DISPLAY: Record<ClassSlug, ClassDisplay> = {
  "oil-painting": {
    slug: "oil-painting",
    name: "Oil Painting",
    blurb: "Master expressive impasto strokes inspired by Van Gogh's Starry Night.",
    imageUrl: "/images/oil-painting.jpg",
    icon: "brush",
  },
  manga: {
    slug: "manga",
    name: "Manga Drawing",
    blurb: "Capture the magical-girl aesthetic — clean linework and celestial shading.",
    imageUrl: "/images/manga.jpg",
    icon: "auto_fix",
  },
  miniature: {
    slug: "miniature",
    name: "Miniature Designing",
    blurb: "Build tiny worlds — a Hobbit hillside in the palm of your hand.",
    imageUrl: "/images/miniature.jpg",
    icon: "home_mini",
  },
  sculpting: {
    slug: "sculpting",
    name: "Sculpting",
    blurb: "Shape volume from material — classical form meets cosmic geometry.",
    imageUrl: "/images/sculpting.jpg",
    icon: "layers",
  },
};

export function isClassSlug(s: string): s is ClassSlug {
  return (CLASS_SLUGS as readonly string[]).includes(s);
}

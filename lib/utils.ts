import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatKwd(fils: number): string {
  return `${(fils / 1000).toFixed(3)} KWD`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(start: string, end: string): string {
  // "18:00" → "6:00pm"
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const hr12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "pm" : "am";
    return `${hr12}${m ? `:${m.toString().padStart(2, "0")}` : ""}${ampm}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

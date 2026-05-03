"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/booking", label: "Classes" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/10 bg-indigo-950/40 px-4 pb-6 pt-3 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(139,92,246,0.15)] md:hidden">
      {NAV.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-transform",
              active
                ? "bg-violet-500/20 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                : "text-slate-400 hover:text-violet-200",
            )}
          >
            <span className="font-display text-[11px] font-medium uppercase tracking-widest">
              {n.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

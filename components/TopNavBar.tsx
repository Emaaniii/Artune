"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/booking", label: "Classes" },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 z-40 w-full border-b border-white/10 bg-indigo-950/30 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-6 py-4 md:px-12">
        <Link href="/dashboard" className="shrink-0">
          <Logo size={36} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-display tracking-tight">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  active
                    ? "text-violet-300 border-b-2 border-violet-500 pb-1"
                    : "text-slate-400 hover:text-white transition-colors"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm font-display text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

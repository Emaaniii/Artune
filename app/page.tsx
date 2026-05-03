import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AuthTabs from "@/components/AuthTabs";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const u = await getCurrentUser();
  if (u) redirect("/dashboard");

  return (
    <main className="relative z-10 flex min-h-screen flex-col">
      <div className="flex-grow flex items-center justify-center p-6 md:p-margin-desktop">
        <div className="grid w-full max-w-[1000px] grid-cols-1 gap-gutter md:grid-cols-2 items-center">
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 px-4">
            <Logo size={96} showWordmark={false} className="mb-2" />
            <h1 className="font-display text-h1 text-primary tracking-tight">Arting</h1>
            <p className="font-body-lg text-on-surface-variant max-w-md leading-relaxed">
              Embark on a creative voyage through the nebula of imagination. Discover, learn, and master the arts in a space designed for visionaries.
            </p>
            <div className="hidden md:flex flex-wrap gap-4 pt-2">
              <span className="text-label-caps text-secondary">✦ IMMERSIVE LEARNING</span>
              <span className="text-label-caps text-secondary">✦ EXPERT CURATION</span>
            </div>
          </div>

          {/* Auth */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="font-display text-h2 text-white">Join the galaxy</h2>
                <p className="text-body-md text-on-surface-variant">
                  Sign up with a Kuwait mobile number, or log in with username & password.
                </p>
              </div>
              <AuthTabs />
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 w-full border-t border-white/5 bg-slate-950/20 px-6 py-6 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="font-display text-sm text-slate-500">
          © Arting · Journey through the nebula of art
        </span>
        <span className="font-display text-sm text-slate-500">Made with ✦ in Kuwait</span>
      </footer>
    </main>
  );
}

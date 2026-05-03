import VerifyOtpForm from "@/components/VerifyOtpForm";
import Logo from "@/components/Logo";
import { redirect } from "next/navigation";
import { KuwaitPhone } from "@/lib/validators";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: { phone?: string };
}) {
  const parsed = KuwaitPhone.safeParse(searchParams.phone);
  if (!parsed.success) redirect("/");
  const phone = parsed.data;

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />

        <div className="star-glass relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size={48} showWordmark={false} className="mb-4" />
            <h1 className="font-display text-h2 text-white mb-1">Verify your phone</h1>
            <p className="font-body-md text-on-surface-variant">
              Enter the 6-digit code we sent to <span className="text-primary">{phone}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Dev mode: check the terminal running <code className="text-violet-300">npm run dev</code> for the code.
            </p>
          </div>

          <VerifyOtpForm phone={phone} />
        </div>
      </div>
    </main>
  );
}

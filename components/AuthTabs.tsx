"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginInput, normalizeKuwaitPhone } from "@/lib/validators";
import { cn } from "@/lib/utils";
import Button from "./ui/Button";
import Input from "./ui/Input";

const PhoneFormSchema = z.object({
  phone: z.string().min(1, "Required"),
});
type PhoneFormValues = z.infer<typeof PhoneFormSchema>;
type LoginValues = z.infer<typeof LoginInput>;

export default function AuthTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: { phone: "" },
  });
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(LoginInput),
    defaultValues: { username: "", password: "" },
  });

  async function onSignup({ phone }: PhoneFormValues) {
    setError(null);
    setLoading(true);
    const normalized = normalizeKuwaitPhone(phone);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not send code. Try again.");
        return;
      }
      router.push(`/verify-otp?phone=${encodeURIComponent(normalized)}`);
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(values: LoginValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Invalid username or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-surface-container-low/50 rounded-xl">
        <button
          onClick={() => setTab("signup")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg font-display font-medium text-sm transition-all",
            tab === "signup"
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-white",
          )}
        >
          Sign up
        </button>
        <button
          onClick={() => setTab("login")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg font-display font-medium text-sm transition-all",
            tab === "login"
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-white",
          )}
        >
          Login
        </button>
      </div>

      {tab === "signup" ? (
        <form onSubmit={phoneForm.handleSubmit(onSignup)} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              PHONE NUMBER (KUWAIT)
            </label>
            <div className="flex">
              <div className="flex items-center gap-2 rounded-l-xl border-y border-l border-white/10 bg-white/5 px-4 text-on-surface">
                <span className="text-lg">🇰🇼</span>
                <span className="font-body-md">+965</span>
              </div>
              <Input
                {...phoneForm.register("phone")}
                inputMode="numeric"
                placeholder="6XXX XXXX"
                className="rounded-l-none rounded-r-xl border-l-0 font-display tracking-widest"
                maxLength={10}
              />
            </div>
            {phoneForm.formState.errors.phone && (
              <p className="mt-2 text-sm text-error">{phoneForm.formState.errors.phone.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
            {loading ? "Sending…" : "Send OTP code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              USERNAME
            </label>
            <Input {...loginForm.register("username")} placeholder="Star-voyager" />
            {loginForm.formState.errors.username && (
              <p className="mt-2 text-sm text-error">{loginForm.formState.errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              PASSWORD
            </label>
            <Input {...loginForm.register("password")} type="password" placeholder="••••••••" />
            {loginForm.formState.errors.password && (
              <p className="mt-2 text-sm text-error">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>
      )}

      {error && (
        <p className="rounded-lg border border-error/40 bg-error-container/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <p className="text-center text-label-caps text-slate-500">
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}

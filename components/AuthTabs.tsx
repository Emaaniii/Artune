"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailSignupInput, LoginInput, normalizeKuwaitPhone } from "@/lib/validators";
import { cn } from "@/lib/utils";
import Button from "./ui/Button";
import Input from "./ui/Input";

const PhoneFormSchema = z.object({
  phone: z.string().min(1, "Required"),
});
type PhoneFormValues = z.infer<typeof PhoneFormSchema>;
type LoginValues = z.infer<typeof LoginInput>;
type EmailSignupValues = z.infer<typeof EmailSignupInput>;

const DevBypassSchema = z.object({
  phone: z.string().min(1, "Required"),
  devKey: z.string().min(1, "Required"),
});
type DevBypassValues = z.infer<typeof DevBypassSchema>;

const DEV_BYPASS_AVAILABLE =
  process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === "1";

export default function AuthTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [signupMode, setSignupMode] = useState<"email" | "phone">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBypass, setShowBypass] = useState(false);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: { phone: "" },
  });
  const emailSignupForm = useForm<EmailSignupValues>({
    resolver: zodResolver(EmailSignupInput),
    defaultValues: { name: "", email: "", password: "" },
  });
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(LoginInput),
    defaultValues: { identifier: "", password: "" },
  });
  const bypassForm = useForm<DevBypassValues>({
    resolver: zodResolver(DevBypassSchema),
    defaultValues: { phone: "", devKey: "" },
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

  async function onEmailSignup(values: EmailSignupValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not create account.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDevBypass(values: DevBypassValues) {
    setError(null);
    setLoading(true);
    const normalized = normalizeKuwaitPhone(values.phone);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, devKey: values.devKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Bypass failed.");
        return;
      }
      router.push(json.needsName ? "/profile" : "/dashboard");
      router.refresh();
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
        <div className="space-y-5">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSignupMode("email");
              }}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 font-label-caps uppercase tracking-widest transition-all",
                signupMode === "email"
                  ? "border-violet-400/60 bg-violet-500/10 text-violet-200"
                  : "border-white/10 text-on-surface-variant hover:bg-white/5",
              )}
            >
              ✉ Email
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSignupMode("phone");
              }}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 font-label-caps uppercase tracking-widest transition-all",
                signupMode === "phone"
                  ? "border-violet-400/60 bg-violet-500/10 text-violet-200"
                  : "border-white/10 text-on-surface-variant hover:bg-white/5",
              )}
            >
              ☎ Phone (KW)
            </button>
          </div>

          {signupMode === "email" ? (
            <form
              onSubmit={emailSignupForm.handleSubmit(onEmailSignup)}
              className="space-y-5"
            >
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                  NAME
                </label>
                <Input
                  {...emailSignupForm.register("name")}
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={60}
                />
                {emailSignupForm.formState.errors.name && (
                  <p className="mt-2 text-sm text-error">
                    {emailSignupForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                  EMAIL
                </label>
                <Input
                  {...emailSignupForm.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {emailSignupForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-error">
                    {emailSignupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                  PASSWORD
                </label>
                <Input
                  {...emailSignupForm.register("password")}
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                {emailSignupForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-error">
                    {emailSignupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={phoneForm.handleSubmit(onSignup)}
              className="space-y-5"
            >
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
          )}
        </div>
      ) : (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              EMAIL OR USERNAME
            </label>
            <Input
              {...loginForm.register("identifier")}
              placeholder="you@example.com or star_voyager"
              autoComplete="username"
            />
            {loginForm.formState.errors.identifier && (
              <p className="mt-2 text-sm text-error">{loginForm.formState.errors.identifier.message}</p>
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

      {DEV_BYPASS_AVAILABLE && (
        <div className="border-t border-white/5 pt-4">
          {!showBypass ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowBypass(true);
              }}
              className="block w-full text-center text-xs uppercase tracking-widest font-label-caps text-on-surface-variant hover:text-violet-300 transition-colors"
            >
              Can&apos;t receive OTP? Use dev bypass →
            </button>
          ) : (
            <form
              onSubmit={bypassForm.handleSubmit(onDevBypass)}
              className="space-y-4 rounded-xl border border-amber-400/30 bg-amber-500/5 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-label-caps text-xs uppercase tracking-widest text-amber-300">
                  Dev bypass login
                </p>
                <button
                  type="button"
                  onClick={() => setShowBypass(false)}
                  className="text-xs text-on-surface-variant hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Logs you into an existing account without OTP. Requires the
                shared bypass key — see <code className="text-amber-300">AUTH_DEV_BYPASS_KEY</code> in <code className="text-amber-300">.env.local</code>.
              </p>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                  PHONE NUMBER
                </label>
                <Input
                  {...bypassForm.register("phone")}
                  inputMode="numeric"
                  placeholder="+965 6XXX XXXX"
                />
                {bypassForm.formState.errors.phone && (
                  <p className="mt-2 text-sm text-error">
                    {bypassForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                  BYPASS KEY
                </label>
                <Input
                  {...bypassForm.register("devKey")}
                  type="password"
                  placeholder="••••••••••••••••"
                  autoComplete="off"
                />
                {bypassForm.formState.errors.devKey && (
                  <p className="mt-2 text-sm text-error">
                    {bypassForm.formState.errors.devKey.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? "Signing in…" : "Sign in (bypass)"}
              </Button>
            </form>
          )}
        </div>
      )}

      <p className="text-center text-label-caps text-slate-500">
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}

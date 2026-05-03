"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function VerifyOtpForm({ phone }: { phone: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Code is incorrect or expired.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Could not resend.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        autoFocus
        inputMode="numeric"
        maxLength={6}
        placeholder="••••••"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="text-center font-display text-2xl tracking-[0.5em]"
      />
      {error && (
        <p className="rounded-lg border border-error/40 bg-error-container/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading || code.length !== 6} className="w-full py-4 text-lg">
        {loading ? "Verifying…" : "Verify & continue"}
      </Button>
      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="w-full text-sm text-violet-300 hover:underline"
      >
        Resend code
      </button>
    </form>
  );
}

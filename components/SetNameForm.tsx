"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function SetNameForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/me/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const j = await res.json();
        setErr(j.error ?? "Could not save name.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="star-glass rounded-xl p-6 max-w-md space-y-4">
      <div>
        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
          WHAT SHOULD WE CALL YOU?
        </label>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
        />
      </div>
      {err && <p className="text-sm text-error">{err}</p>}
      <Button type="submit" disabled={loading || name.trim().length < 1}>
        {loading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

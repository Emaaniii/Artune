"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "./ui/Button";
import Input from "./ui/Input";

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  username: z
    .string()
    .trim()
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional()
    .refine(
      (v) => v === undefined || (v.length >= 3 && /^[a-zA-Z0-9_]+$/.test(v)),
      { message: "Username must be 3+ chars, letters/numbers/underscore only" },
    ),
  password: z
    .string()
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional()
    .refine((v) => v === undefined || v.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function ProfileForm({
  initialName,
  initialUsername,
  phone,
}: {
  initialName: string;
  initialUsername: string;
  phone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: initialName,
      username: initialUsername,
      password: "",
    },
  });

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  async function onSubmit(values: ProfileValues) {
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not save profile. Try again.");
        return;
      }
      setSaved(true);
      reset({
        name: values.name,
        username: values.username ?? "",
        password: "",
      });
      router.refresh();
    } catch {
      setError("Could not save profile. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="star-glass rounded-xl p-6 max-w-xl space-y-5"
    >
      <div>
        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
          PHONE
        </label>
        <Input value={phone} readOnly disabled className="opacity-70 cursor-not-allowed" />
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
          NAME
        </label>
        <Input {...register("name")} placeholder="Your name" maxLength={60} />
        {errors.name && (
          <p className="mt-2 text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
          USERNAME
        </label>
        <Input
          {...register("username")}
          placeholder="star_voyager"
          maxLength={40}
          autoComplete="username"
        />
        {errors.username && (
          <p className="mt-2 text-sm text-error">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
          NEW PASSWORD
        </label>
        <Input
          {...register("password")}
          type="password"
          placeholder="Leave blank to keep current"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-error/40 bg-error-container/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="font-display text-sm text-violet-300 transition-opacity">
            Saved ✦
          </span>
        )}
      </div>
    </form>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const errorCopy = (error: string) => {
  if (error.includes("Invalid login credentials")) {
    return "Email atau password salah.";
  }
  return error;
};

export const LoginForm = () => {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFeedback(errorCopy(error.message));
        return;
      }

      router.replace("/owner");
      router.refresh();
    });
  };

  const handleMagicLink = async () => {
    setFeedback(null);
    if (!email) {
      setFeedback("Masukkan email kamu dulu.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/owner`,
        },
      });

      if (error) {
        setFeedback(errorCopy(error.message));
        return;
      }

      setFeedback("Magic link dikirim. Cek inbox kamu.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-white/70">
        Email
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          placeholder="owner@domain.com"
        />
      </label>
      <label className="block text-sm font-medium text-white/70">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          placeholder="••••••••"
        />
      </label>

      {feedback && (
        <div className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {feedback}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={isPending}
          className="text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline disabled:cursor-not-allowed disabled:text-white/40"
        >
          Kirim magic link
        </button>
      </div>
    </form>
  );
};

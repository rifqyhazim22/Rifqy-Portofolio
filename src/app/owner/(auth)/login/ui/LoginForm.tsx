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

const SITE_URL = process.env.NEXT_PUBLIC_SUPABASE_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

const buildRedirectUrl = () => {
  if (SITE_URL) {
    return `${SITE_URL.replace(/\/$/, "")}/owner`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/owner`;
  }
  return undefined;
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
          emailRedirectTo: buildRedirectUrl(),
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
    <form onSubmit={handleSubmit} className="owner-login__form">
      <div className="owner-login__fields">
        <label className="owner-login__field">
          <span>Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="owner@domain.com"
          />
        </label>
        <label className="owner-login__field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </label>
      </div>

      {feedback && (
        <div className="owner-login__feedback" role="alert">
          {feedback}
        </div>
      )}

      <div className="owner-login__actions">
        <button
          type="submit"
          disabled={isPending}
          className="owner-login__submit"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={isPending}
          className="owner-login__link"
        >
          Kirim magic link
        </button>
      </div>
    </form>
  );
};

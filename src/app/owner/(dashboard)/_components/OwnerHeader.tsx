"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type OwnerHeaderProps = {
  email?: string;
};

export const OwnerHeader = ({ email }: OwnerHeaderProps) => {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/owner/login?status=signed-out");
    });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-white/70">Signed in as</p>
        <p className="font-semibold text-white">{email ?? "Owner"}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:text-white/80 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>
    </header>
  );
};

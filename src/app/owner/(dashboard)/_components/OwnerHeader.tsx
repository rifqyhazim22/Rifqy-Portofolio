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
    <header className="owner-header">
      <div>
        <p>Owner session</p>
        <strong>{email ?? "Owner"}</strong>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="owner-header__signout"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>
    </header>
  );
};

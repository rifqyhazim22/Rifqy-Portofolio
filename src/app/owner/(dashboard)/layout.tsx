import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { OwnerHeader } from "./_components/OwnerHeader";
import { createSupabaseServerClient } from "@/lib/supabase";

type OwnerLayoutProps = {
  children: ReactNode;
};

export default async function OwnerLayout({ children }: OwnerLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/owner/login?reason=signin-required");
  }

  const allowedEmail = process.env.SUPABASE_OWNER_EMAIL?.toLowerCase();
  if (allowedEmail && user.email?.toLowerCase() !== allowedEmail) {
    redirect("/owner/login?reason=unauthorized");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <OwnerHeader email={user.email ?? undefined} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

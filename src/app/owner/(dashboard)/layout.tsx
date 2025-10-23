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
    <div className="owner-shell">
      <div className="owner-shell__backdrop" aria-hidden />
      <div className="owner-shell__frame">
        <OwnerHeader email={user.email ?? undefined} />
        <main className="owner-shell__main">{children}</main>
      </div>
    </div>
  );
}

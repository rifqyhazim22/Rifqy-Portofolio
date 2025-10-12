import { Metadata } from "next";
import { LoginForm } from "./ui/LoginForm";

export const metadata: Metadata = {
  title: "Owner Login • Rifqy Hazim HR",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const reasonCopy: Record<string, string> = {
  "signin-required": "Please sign in to access the owner dashboard.",
  unauthorized: "Your account is not approved for owner access.",
};

const statusCopy: Record<string, string> = {
  "signed-out": "You have been signed out.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = (await searchParams) ?? {};
  const reasonParam = resolved.reason;
  const statusParam = resolved.status;

  const reasonKey = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;
  const statusKey = Array.isArray(statusParam) ? statusParam[0] : statusParam;

  const reasonMessage = reasonKey ? reasonCopy[reasonKey] ?? null : null;
  const statusMessage = statusKey ? statusCopy[statusKey] ?? null : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/60">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Owner access
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Sign in with the Supabase credentials configured for this project.
          </p>
        </div>
        {statusMessage && (
          <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {statusMessage}
          </div>
        )}
        {reasonMessage && (
          <div className="rounded-xl border border-orange-300/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
            {reasonMessage}
          </div>
        )}
        <LoginForm />
        <p className="text-xs text-white/40">
          Tip: keep a separate owner account with{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white">
            SUPABASE_OWNER_EMAIL
          </code>{" "}
          so you can differentiate admin activity from visitor journeys.
        </p>
      </div>
    </div>
  );
}

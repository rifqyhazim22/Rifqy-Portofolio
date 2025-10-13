import { Metadata } from "next";
import { getCurrentLanguage } from "@/lib/language";
import { LoginForm } from "./ui/LoginForm";

export const metadata: Metadata = {
  title: "Owner Login • Rifqy Hazim HR",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const reasonCopy: Record<string, { id: string; en: string }> = {
  "signin-required": {
    id: "Silakan masuk terlebih dahulu.",
    en: "Please sign in to access the owner dashboard.",
  },
  unauthorized: {
    id: "Akun kamu belum diberi akses owner.",
    en: "Your account is not approved for owner access.",
  },
};

const statusCopy: Record<string, { id: string; en: string }> = {
  "signed-out": {
    id: "Kamu sudah keluar dari dashboard.",
    en: "You have been signed out.",
  },
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = (await searchParams) ?? {};
  const reasonParam = resolved.reason;
  const statusParam = resolved.status;
  const lang = await getCurrentLanguage();

  const reasonKey = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;
  const statusKey = Array.isArray(statusParam) ? statusParam[0] : statusParam;

  const reasonMessage = reasonKey ? reasonCopy[reasonKey]?.[lang] ?? null : null;
  const statusMessage = statusKey ? statusCopy[statusKey]?.[lang] ?? null : null;

  const copy = {
    title: lang === "id" ? "Portal Owner" : "Owner Portal",
    subtitle:
      lang === "id"
        ? "Masuk dengan kredensial Supabase yang kamu konfigurasi."
        : "Sign in with the Supabase credentials you configured.",
    tip:
      lang === "id"
        ? "Saran: buat akun owner terpisah agar aktivitasmu mudah dibedakan dari pengunjung."
        : "Tip: keep a separate owner account so you can differentiate admin activity from visitors.",
  };

  return (
    <div className="owner-login">
      <div className="owner-login__card" data-animate>
        <header className="owner-login__header">
          <span>Rifqy Hazim HR</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>
        <div className="owner-login__messages">
          {statusMessage && (
            <div className="owner-login__badge owner-login__badge--success">{statusMessage}</div>
          )}
          {reasonMessage && (
            <div className="owner-login__badge owner-login__badge--warn">{reasonMessage}</div>
          )}
        </div>
        <LoginForm />
        <p className="owner-login__tip">{copy.tip}</p>
      </div>
    </div>
  );
}

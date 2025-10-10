import type { Metadata } from "next";
import "./globals.css";
import AgentChat from "@/components/AgentChat";
import Header from "@/components/Header";
import PointerGlow from "@/components/PointerGlow";
import ScrollOrchestrator from "@/components/ScrollOrchestrator";
import { getCurrentLanguage } from "@/lib/language";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);

  return {
    title: "Rifqy Hazim HR — Home",
    description: dictionary.home.hero.summary,
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);

  return (
    <html lang={language} data-theme="dark" data-palette="midnight" data-font-scale="base" data-tone="formal">
      <body>
        <PointerGlow />
        <ScrollOrchestrator />
        <Header
          brand={dictionary.brand}
          navLabels={dictionary.navLabels}
          language={language}
          languageToggle={dictionary.languageToggle}
        />
        <main className="wrap">{children}</main>
        <AgentChat />
      </body>
    </html>
  );
}

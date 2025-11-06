import { notFound } from "next/navigation";
import ArenaClient from "@/components/playbooks/ArenaClient";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function PlaybookArenaPage({
  params,
}: {
  params: Promise<{ playbookId: string }>;
}) {
  const { playbookId } = await params;
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const game = dictionary.trainingGames.find((item) => item.playbookId === playbookId);

  if (!game) {
    notFound();
  }

  return <ArenaClient game={game} />;
}

import PlaybooksExperience from "@/components/playbooks/PlaybooksExperience";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function PlaybooksPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const {
    industry,
    industryInteractive,
    learningHub,
    trainingGames,
    nextStepsHeading,
    navLabels,
  } = dictionary;
  return (
    <PlaybooksExperience
      overview={industry}
      interactive={industryInteractive}
      learningHub={learningHub}
      trainingGames={trainingGames}
      nextStepsHeading={nextStepsHeading}
      navLabels={navLabels}
    />
  );
}

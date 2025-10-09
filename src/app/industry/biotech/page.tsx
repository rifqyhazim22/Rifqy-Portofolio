import NextSteps from "@/components/NextSteps";
import IndustryDetailContent from "@/components/IndustryDetailContent";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

const slug = "biotech" as const;

export default async function BiotechIndustryPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const detail = dictionary.industryDetails[slug];

  return (
    <div>
      <IndustryDetailContent
        detail={detail}
        backHref="/playbooks"
        backLabel={dictionary.general.backToIndustry}
      />

      <hr />

      <NextSteps current="industry" heading={dictionary.nextStepsHeading} navLabels={dictionary.navLabels} />
    </div>
  );
}

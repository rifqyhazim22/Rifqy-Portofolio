import NextSteps from "@/components/NextSteps";
import UpdateDetailContent from "@/components/UpdateDetailContent";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

const slug = "biotech-notes" as const;

export default async function BiotechNotesUpdatePage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const detail = dictionary.updates.details[slug];

  return (
    <div>
      <UpdateDetailContent
        detail={detail}
        backHref="/updates"
        backLabel={dictionary.general.backToUpdates}
        dateLabel={dictionary.general.dateLabel}
      />

      <hr />

      <NextSteps current="updates" heading={dictionary.nextStepsHeading} navLabels={dictionary.navLabels} />
    </div>
  );
}

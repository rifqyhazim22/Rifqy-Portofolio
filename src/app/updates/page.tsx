import NextSteps from "@/components/NextSteps";
import UpdatesList from "@/components/UpdatesList";
import BaseLink from "@/components/BaseLink";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function UpdatesPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { updates, home, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="updates">
      <section className="updates__hero" data-animate>
        <h1 className="h1">{updates.title}</h1>
        <p className="sub">{updates.intro}</p>
      </section>

      {updates.spotlight?.length ? (
        <section className="updates__spotlight" data-animate>
          <h2 className="h2">Spotlight</h2>
          <div className="grid grid-2">
            {updates.spotlight.map((item) => (
              <BaseLink key={item.href} href={item.href} className="card">
                <div className="k">{item.title}</div>
                <div className="sub">{item.summary}</div>
              </BaseLink>
            ))}
          </div>
        </section>
      ) : null}

      <section data-animate>
        <UpdatesList items={updates.list} showAllLink={false} allLinkLabel={home.updates.cta.label} />
      </section>

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="updates" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function PlaybooksPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { industry, nextStepsHeading, navLabels } = dictionary;

  return (
    <div>
      <h1 className="h1">{industry.title}</h1>
      <p className="sub">{industry.intro}</p>

      <div className="grid grid-2" style={{ marginTop: "12px" }}>
        {industry.playbooks.map((item) => (
          <BaseLink key={item.href} className="card" href={item.href}>
            <div className="k">{item.title}</div>
            <div className="sub">{item.sub}</div>
          </BaseLink>
        ))}
      </div>

      <hr />

      <section id="learning-hub">
        <h2 className="h2">{industry.learningHeading}</h2>
        <p className="sub">{industry.learningDescription}</p>
      </section>

      {industry.learningCards.map((card) => (
        <section key={card.id} id={card.id}>
          <div className="card" style={{ marginTop: "12px" }}>
            <div className="k">{card.title}</div>
            {card.points.map((point, index) => (
              <div
                className="sub"
                key={point.title}
                style={{ marginTop: index === 0 ? "6px" : "8px" }}
              >
                <strong>{point.title}</strong> {point.body}
              </div>
            ))}
          </div>
        </section>
      ))}

      <hr />

      <NextSteps current="industry" heading={nextStepsHeading} navLabels={navLabels} />
    </div>
  );
}

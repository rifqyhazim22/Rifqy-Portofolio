import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function PlaybooksPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { industry, industryInteractive, learningHub, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="playbooks" data-animate>
      <section className="playbooks__hero" data-animate>
        <h1 className="h1">{industry.title}</h1>
        <p className="sub">{industry.intro}</p>
      </section>

      <section className="playbooks__grid" data-animate>
        <div className="grid grid-3">
          {industry.playbooks.map((item) => (
            <BaseLink key={item.href} className="card playbooks__card" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
      </section>

      <section className="playbooks__interactive" data-animate>
        <h2 className="h2">{industryInteractive.heading}</h2>
        <p className="sub">{industryInteractive.description}</p>
        <div className="grid grid-3">
          {industryInteractive.playbooks.map((playbook) => (
            <div key={playbook.id} className="card playbooks__interactive-card">
              <div className="playbooks__tag">{playbook.tags.join(" · ")}</div>
              <div className="k">{playbook.title}</div>
              <p className="sub">{playbook.summary}</p>
              <div className="playbooks__wins">
                {playbook.wins.map((win) => (
                  <span key={win}>{win}</span>
                ))}
              </div>
              <details className="playbooks__details">
                <summary>Langkah kilat</summary>
                <div className="playbooks__steps">
                  {playbook.steps.map((step) => (
                    <div key={step.title} className="playbooks__step">
                      <strong>{step.title}</strong>
                      <p className="sub">{step.body}</p>
                    </div>
                  ))}
                </div>
              </details>
              <div className="playbooks__resources">
                {playbook.resources.map((resource) => (
                  <BaseLink key={resource.href} href={resource.href} className="pill">
                    {resource.title}
                  </BaseLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="playbooks__learning" data-animate>
        <h2 className="h2">{industry.learningHeading}</h2>
        <p className="sub">{industry.learningDescription}</p>
        <div className="grid grid-3">
          {industry.learningCards.map((card) => (
            <div key={card.id} className="card playbooks__lesson">
              <div className="k">{card.title}</div>
              <div className="playbooks__lesson-points">
                {card.points.map((point) => (
                  <div key={point.title} className="sub">
                    <strong>{point.title}</strong> {point.body}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="playbooks__cta">
          <BaseLink href={learningHub.cta.href} className="pill">
            {learningHub.cta.label}
          </BaseLink>
        </div>
      </section>

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="industry" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

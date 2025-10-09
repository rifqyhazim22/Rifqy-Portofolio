import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function LearningHubPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { learningHub, industryInteractive, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="learning" data-animate>
      <section className="learning__hero" data-animate>
        <h1 className="h1">{learningHub.title}</h1>
        <p className="sub">{learningHub.intro}</p>
        <p className="sub">{learningHub.subtitle}</p>
        <div className="learning__cta">
          <BaseLink className="pill hero__action hero__action--primary" href={learningHub.cta.href}>
            {learningHub.cta.label}
          </BaseLink>
        </div>
      </section>

      <section className="learning__tracks" data-animate>
        <h2 className="h2">Tracks</h2>
        <div className="grid grid-3">
          {learningHub.tracks.map((track) => (
            <div key={track.id} className="card learning__track">
              <div className="k">{track.title}</div>
              <p className="sub">{track.description}</p>
              <div className="learning__modules">
                {track.modules.map((module) => (
                  <div key={module.title} className="learning__module">
                    <div className="learning__module-header">
                      <span className="learning__module-title">{module.title}</span>
                      <span className="learning__module-duration">{module.duration}</span>
                    </div>
                    <div className="sub">{module.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="learning__interactive" data-animate>
        <h2 className="h2">{industryInteractive.heading}</h2>
        <p className="sub">{industryInteractive.description}</p>
        <div className="grid grid-3">
          {industryInteractive.playbooks.map((playbook) => (
            <div key={playbook.id} className="card learning__interactive-card">
              <div className="learning__badge">{playbook.tags.join(" · ")}</div>
              <div className="k">{playbook.title}</div>
              <p className="sub">{playbook.summary}</p>
              <ul className="learning__wins">
                {playbook.wins.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="learning__steps">
                {playbook.steps.map((step) => (
                  <div key={step.title} className="learning__step">
                    <strong>{step.title}</strong>
                    <p className="sub">{step.body}</p>
                  </div>
                ))}
              </div>
              <div className="learning__resources">
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

      <div className="hr" data-animate />
      <div data-animate>
        <NextSteps current="industry" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

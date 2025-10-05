import Hero from "@/components/Hero";
import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function HomePage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { home, updates, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="home">
      <Hero hero={home.hero} />

      <section className="card home__quote">
        <div className="home__quote-label">{home.quote.label}</div>
        <p className="home__quote-text">{home.quote.text}</p>
      </section>

      <section className="home__section">
        <header className="home__section-header">
          <h2 className="h2">{home.whatIDo.heading}</h2>
        </header>
        <div className="grid grid-3 home__tiles">
          {home.whatIDo.items.map((item) => (
            <BaseLink key={item.href} className="tile" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
      </section>

      <section className="home__section">
        <header className="home__section-header">
          <h2 className="h2">{home.playbooks.heading}</h2>
          <p className="sub home__section-sub">{home.playbooks.description}</p>
        </header>
        <div className="grid grid-3 home__tiles">
          {home.playbooks.items.map((item) => (
            <BaseLink key={item.href} href={item.href} className="tile">
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
        {home.playbooks.cta ? (
          <div className="home__actions">
            <BaseLink href={home.playbooks.cta.href} className="pill">
              {home.playbooks.cta.label}
            </BaseLink>
          </div>
        ) : null}
      </section>

      <section className="home__section">
        <header className="home__section-header">
          <h2 className="h2">{home.learning.heading}</h2>
          <p className="sub home__section-sub">{home.learning.description}</p>
        </header>
        <div className="home__actions">
          <BaseLink href={home.learning.cta.href} className="pill">
            {home.learning.cta.label}
          </BaseLink>
        </div>
      </section>

      <section className="home__section">
        <header className="home__section-header">
          <h2 className="h2">{home.updates.heading}</h2>
        </header>
        <div className="grid home__tiles">
          {updates.list.slice(0, 3).map((item) => (
            <BaseLink key={item.href} className="tile" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.summary}</div>
            </BaseLink>
          ))}
        </div>
        <div className="home__actions">
          <BaseLink href={home.updates.cta.href} className="pill">
            {home.updates.cta.label}
          </BaseLink>
        </div>
      </section>

      <div className="hr" />

      <NextSteps heading={nextStepsHeading} navLabels={navLabels} />
    </div>
  );
}

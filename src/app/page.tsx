import Hero from "@/components/Hero";
import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function HomePage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { home, nextStepsHeading, navLabels } = dictionary;

  const hero = home.hero;
  const quote = home.quote;
  const journey = home.journey;
  const whatIDo = home.whatIDo;

  return (
    <div className="home">
      <Hero hero={hero} />

      {home.promo && home.promo.title ? (
        <section className="card home__promo" data-animate>
          <div className="home__promo-title">{home.promo.title}</div>
          <p className="sub home__promo-text">{home.promo.body}</p>
          <div className="home__promo-actions">
            <BaseLink href={home.promo.buttonHref} className="pill hero__action hero__action--primary">
              {home.promo.buttonLabel}
            </BaseLink>
          </div>
        </section>
      ) : null}

      <section className="card home__quote">
        <div className="home__quote-label">{quote.label}</div>
        <p className="home__quote-text">{quote.text}</p>
      </section>

      {journey ? (
        <section className="card home__journey" data-animate>
          <div className="home__journey-label">{journey.label}</div>
          <p className="home__journey-text">{journey.text}</p>
        </section>
      ) : null}

      <section className="home__section" data-animate>
        <header className="home__section-header">
          <h2 className="h2">{whatIDo.heading}</h2>
        </header>
        <div className="grid grid-3 home__tiles">
          {whatIDo.items.map((item) => (
            <BaseLink key={item.href + item.title} className="tile" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
      </section>

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

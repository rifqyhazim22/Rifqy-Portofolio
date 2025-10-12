import Hero from "@/components/Hero";
import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";
import {
  fetchSiteSections,
  fetchFeaturedProjects,
  type ProjectRecord,
} from "@/lib/supabase/content";
import type {
  HomeHeroContent,
  HomePlaybooksSection,
  HomeSection,
  HomeLearningSection,
  HomeUpdatesSection,
} from "@/content/home/types";

export default async function HomePage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { home, updates, nextStepsHeading, navLabels } = dictionary;

  const [sections, featuredProjects] = await Promise.all([
    fetchSiteSections([
      "home-hero",
      "home-promo",
      "home-quote",
      "home-journey",
      "home-what-i-do",
      "home-playbooks",
      "home-learning",
      "home-updates",
      "home-featured",
    ]),
    fetchFeaturedProjects(),
  ]);

  const mergeHero = (defaultHero: HomeHeroContent): HomeHeroContent => {
    const record = sections["home-hero"];
    if (!record?.metadata) return defaultHero;
    const metadata = record.metadata as Partial<HomeHeroContent>;
    return {
      ...defaultHero,
      ...metadata,
      summary: metadata.summary ?? defaultHero.summary,
      tagline: metadata.tagline ?? defaultHero.tagline,
      availability: metadata.availability ?? defaultHero.availability,
      actions: Array.isArray(metadata.actions) ? (metadata.actions as HomeHeroContent["actions"]) : defaultHero.actions,
      highlights: Array.isArray(metadata.highlights)
        ? (metadata.highlights as HomeHeroContent["highlights"])
        : defaultHero.highlights,
    };
  };

  const mergeSection = <
    T extends HomeSection | HomePlaybooksSection | HomeLearningSection | HomeUpdatesSection,
  >(
    slug: string,
    fallback: T,
  ): T => {
    const record = sections[slug];
    if (!record) return fallback;
    const metadata = (record.metadata ?? {}) as Partial<T>;
    const next = { ...fallback, ...metadata } as T;

    if ("heading" in fallback && record.title) {
      (next as HomeSection).heading = record.title as any;
    }

    if ("description" in fallback && record.body) {
      (next as HomePlaybooksSection).description = record.body;
    } else if (!("description" in fallback) && record.body && "text" in fallback) {
      (next as any).text = record.body;
    }

    return next;
  };

  const hero = mergeHero(home.hero);
  const promoRecord = sections["home-promo"];
  const promo = promoRecord
    ? {
        title: promoRecord.title ?? home.promo?.title ?? "",
        body: promoRecord.body ?? home.promo?.body ?? "",
        buttonLabel:
          (promoRecord.metadata?.buttonLabel as string | undefined) ?? home.promo?.buttonLabel ?? "",
        buttonHref:
          (promoRecord.metadata?.buttonHref as string | undefined) ?? home.promo?.buttonHref ?? "#",
      }
    : home.promo;

  const quoteRecord = sections["home-quote"];
  const quote = quoteRecord
    ? {
        label: quoteRecord.title ?? home.quote.label,
        text: quoteRecord.body ?? home.quote.text,
      }
    : home.quote;

  const journeyRecord = sections["home-journey"];
  const journey = journeyRecord
    ? {
        label: journeyRecord.title ?? home.journey.label,
        text: journeyRecord.body ?? home.journey.text,
      }
    : home.journey;

  const whatIDo = mergeSection("home-what-i-do", home.whatIDo);
  const playbooks = mergeSection("home-playbooks", home.playbooks);
  const learning = mergeSection("home-learning", home.learning);
  const updatesSection = mergeSection("home-updates", home.updates);

  const featuredShowcase = featuredProjects
    .slice(0, 3)
    .map((project: ProjectRecord) => ({
      href: project.link_url ?? (project.slug ? `/projects/${project.slug}` : "#"),
      title: project.title,
      sub: project.tagline ?? project.description ?? "",
    }));

  const featuredRecord = sections["home-featured"];
  const featuredMetadataItems = Array.isArray(featuredRecord?.metadata?.items)
    ? (featuredRecord!.metadata!.items as Array<{ href: string; title: string; sub: string }>)
    : null;

  const fallbackFeatured = featuredShowcase.length
    ? featuredShowcase
    : dictionary.projects.gallery.slice(0, 3).map((item) => ({
        href: item.href,
        title: item.title,
        sub: item.sub,
      }));

  const featuredCards = featuredMetadataItems?.length ? featuredMetadataItems : fallbackFeatured;

  const featuredHeading = featuredRecord?.title ?? (language === "id" ? "Proyek Unggulan" : "Featured Projects");
  const featuredDescription = featuredRecord?.body ?? (featuredRecord ? "" : dictionary.projects.intro);

  return (
    <div className="home">
      <Hero hero={hero} />

      {promo && promo.title ? (
        <section className="card home__promo" data-animate>
          <div className="home__promo-title">{promo.title}</div>
          <p className="sub home__promo-text">{promo.body}</p>
          <div className="home__promo-actions">
            <BaseLink href={promo.buttonHref} className="pill hero__action hero__action--primary">
              {promo.buttonLabel}
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
            <BaseLink key={item.href} className="tile" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
      </section>

      <section className="home__section" data-animate>
        <header className="home__section-header">
          <h2 className="h2">{playbooks.heading}</h2>
          <p className="sub home__section-sub">{playbooks.description}</p>
        </header>
        <div className="grid grid-3 home__tiles">
          {playbooks.items.map((item) => (
            <BaseLink key={item.href} href={item.href} className="tile">
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
        {playbooks.cta ? (
          <div className="home__actions">
            <BaseLink href={playbooks.cta.href} className="pill">
              {playbooks.cta.label}
            </BaseLink>
          </div>
        ) : null}
      </section>

      <section className="home__section" data-animate>
        <header className="home__section-header">
          <h2 className="h2">{learning.heading}</h2>
          <p className="sub home__section-sub">{learning.description}</p>
        </header>
        <div className="home__actions">
          <BaseLink href={learning.cta.href} className="pill">
            {learning.cta.label}
          </BaseLink>
        </div>
      </section>

      <section className="home__section" data-animate>
        <header className="home__section-header">
          <h2 className="h2">{updatesSection.heading}</h2>
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
          <BaseLink href={updatesSection.cta.href} className="pill">
            {updatesSection.cta.label}
          </BaseLink>
        </div>
      </section>

      {featuredCards.length > 0 ? (
        <section className="home__section" data-animate>
          <header className="home__section-header">
            <h2 className="h2">{featuredHeading}</h2>
            {featuredDescription ? (
              <p className="sub home__section-sub">{featuredDescription}</p>
            ) : null}
          </header>
          <div className="grid home__tiles">
            {featuredCards.map((item) => (
              <BaseLink key={`${item.href}-${item.title}`} className="tile" href={item.href}>
                <div className="k">{item.title}</div>
                <div className="sub">{item.sub}</div>
              </BaseLink>
            ))}
          </div>
        </section>
      ) : null}

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

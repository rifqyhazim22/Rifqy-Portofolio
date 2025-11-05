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
import { resolveLocalizedMetadata, resolveLocalizedText } from "@/lib/siteSections";
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

  const selectHero = (fallback: HomeHeroContent): HomeHeroContent => {
    const record = sections["home-hero"];
    if (!record) return fallback;

    const localized =
      resolveLocalizedMetadata<HomeHeroContent>(record.metadata, language) ??
      (language === "id" && record.metadata ? (record.metadata as Partial<HomeHeroContent>) : null);

    if (!localized) {
      return fallback;
    }

    return {
      ...fallback,
      ...localized,
      name: typeof localized.name === "string" ? localized.name : fallback.name,
      title: typeof localized.title === "string" ? localized.title : fallback.title,
      summary: typeof localized.summary === "string" ? localized.summary : fallback.summary,
      tagline: typeof localized.tagline === "string" ? localized.tagline : fallback.tagline,
      availability:
        typeof localized.availability === "string" ? localized.availability : fallback.availability,
      actions: Array.isArray(localized.actions)
        ? (localized.actions as HomeHeroContent["actions"])
        : fallback.actions,
      highlights: Array.isArray(localized.highlights)
        ? (localized.highlights as HomeHeroContent["highlights"])
        : fallback.highlights,
      portraitSrc:
        typeof localized.portraitSrc === "string"
          ? localized.portraitSrc
          : fallback.portraitSrc,
      backgroundSrc:
        typeof localized.backgroundSrc === "string"
          ? localized.backgroundSrc
          : fallback.backgroundSrc,
    };
  };

  const buildSection = <
    T extends HomeSection | HomePlaybooksSection | HomeLearningSection | HomeUpdatesSection,
  >(
    slug: string,
    fallback: T,
  ): T => {
    const record = sections[slug];
    if (!record) return fallback;

    const localized =
      resolveLocalizedMetadata<T>(record.metadata, language) ??
      (language === "id" && record.metadata ? (record.metadata as Partial<T>) : null);

    const next = { ...fallback, ...(localized ?? {}) } as T;

    if ("heading" in fallback) {
      const currentHeading =
        (localized as Partial<HomeSection>)?.heading ?? (fallback as HomeSection).heading;
      (next as HomeSection).heading = resolveLocalizedText(
        record.title,
        language,
        typeof currentHeading === "string" ? currentHeading : (fallback as HomeSection).heading,
      );
    }

    if ("description" in fallback) {
      const fallbackDescription =
        typeof (localized as Partial<HomePlaybooksSection>)?.description === "string"
          ? (localized as Partial<HomePlaybooksSection>).description!
          : (fallback as HomePlaybooksSection).description;
      (next as HomePlaybooksSection).description = resolveLocalizedText(
        record.body,
        language,
        fallbackDescription,
      );
    } else if ("text" in fallback) {
      const fallbackText =
        typeof (localized as Partial<HomeSection & { text?: string }>)?.text === "string"
          ? (localized as Partial<HomeSection & { text?: string }>).text!
          : (fallback as HomeSection & { text: string }).text;
      (next as HomeSection & { text: string }).text = resolveLocalizedText(
        record.body,
        language,
        fallbackText,
      );
    }

    return next;
  };

  const hero = selectHero(home.hero);

  const promoRecord = sections["home-promo"];
  type PromoMetadata = {
    title?: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };

  const promoMetadata: Partial<PromoMetadata> | null =
    resolveLocalizedMetadata<PromoMetadata>(promoRecord?.metadata, language) ??
    (language === "id" && promoRecord?.metadata
      ? (promoRecord.metadata as Partial<PromoMetadata>)
      : null);

  const promoTitle = resolveLocalizedText(
    promoRecord?.title,
    language,
    typeof promoMetadata?.title === "string"
      ? promoMetadata.title
      : home.promo?.title ?? "",
  );
  const promoBody = resolveLocalizedText(
    promoRecord?.body,
    language,
    typeof promoMetadata?.body === "string" ? promoMetadata.body : home.promo?.body ?? "",
  );
  const promoButtonLabel =
    typeof promoMetadata?.buttonLabel === "string"
      ? promoMetadata.buttonLabel
      : home.promo?.buttonLabel ?? "";
  const promoButtonHref =
    typeof promoMetadata?.buttonHref === "string"
      ? promoMetadata.buttonHref
      : home.promo?.buttonHref ?? "#";

  const promo =
    promoRecord || promoMetadata
      ? {
          title: promoTitle,
          body: promoBody,
          buttonLabel: promoButtonLabel,
          buttonHref: promoButtonHref,
        }
      : home.promo;

  const quoteRecord = sections["home-quote"];
  const quote = {
    label: resolveLocalizedText(quoteRecord?.title, language, home.quote.label),
    text: resolveLocalizedText(quoteRecord?.body, language, home.quote.text),
  };

  const journeyRecord = sections["home-journey"];
  const journey = {
    label: resolveLocalizedText(journeyRecord?.title, language, home.journey.label),
    text: resolveLocalizedText(journeyRecord?.body, language, home.journey.text),
  };

  const whatIDo = buildSection("home-what-i-do", home.whatIDo);
  const playbooks = buildSection("home-playbooks", home.playbooks);
  const learning = buildSection("home-learning", home.learning);
  const updatesSection = buildSection("home-updates", home.updates);

  const featuredShowcase = featuredProjects
    .slice(0, 3)
    .map((project: ProjectRecord) => ({
      href: project.link_url ?? (project.slug ? `/projects/${project.slug}` : "#"),
      title: project.title,
      sub: project.tagline ?? project.description ?? "",
    }));

  const featuredRecord = sections["home-featured"];
  type FeaturedMetadata = {
    heading?: string;
    body?: string;
    items?: Array<{ href: string; title: string; sub: string }>;
  };

  const featuredMetadata: Partial<FeaturedMetadata> | null =
    resolveLocalizedMetadata<FeaturedMetadata>(featuredRecord?.metadata, language) ??
    (language === "id" && featuredRecord?.metadata
      ? (featuredRecord.metadata as Partial<FeaturedMetadata>)
      : null);

  const featuredMetadataItems =
    featuredMetadata && Array.isArray(featuredMetadata.items)
      ? featuredMetadata.items
      : null;

  const fallbackFeatured = featuredShowcase.length
    ? featuredShowcase
    : dictionary.projects.gallery.slice(0, 3).map((item) => ({
        href: item.href,
        title: item.title,
        sub: item.sub,
      }));

  const featuredCards = featuredMetadataItems?.length ? featuredMetadataItems : fallbackFeatured;

  const featuredHeading = resolveLocalizedText(
    featuredRecord?.title,
    language,
    typeof featuredMetadata?.heading === "string"
      ? featuredMetadata.heading
      : language === "id"
        ? "Proyek Unggulan"
        : "Featured Projects",
  );

  const featuredDescription = resolveLocalizedText(
    featuredRecord?.body,
    language,
    typeof featuredMetadata?.body === "string"
      ? featuredMetadata.body
      : featuredRecord
        ? ""
        : dictionary.projects.intro,
  );

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

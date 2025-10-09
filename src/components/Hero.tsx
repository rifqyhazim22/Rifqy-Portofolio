import Image from "next/image";
import BaseLink from "./BaseLink";
import type { HomeHeroContent } from "@/content/home/types";

interface HeroProps {
  hero: HomeHeroContent;
}

function getActionClass(variant: string | undefined) {
  switch (variant) {
    case "primary":
      return "hero__action hero__action--primary";
    case "outline":
      return "hero__action hero__action--outline";
    default:
      return "hero__action";
  }
}

export default function Hero({ hero }: HeroProps) {
  const portraitSrc = hero.portraitSrc ?? "/images/hero.jpg";
  const backgroundSrc = hero.backgroundSrc ?? "/images/hero-background.png";
  const primaryActions = hero.actions.slice(0, 2);
  const secondaryActions = hero.actions.slice(2);

  return (
    <section className="hero" data-animate>
      <div className="hero__background" aria-hidden="true">
        <Image
          src={backgroundSrc}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 70vw"
          className="hero__background-image"
        />
        <div className="hero__backdrop" />
      </div>

      <div className="hero__grid">
        <div className="hero__info" data-animate>
          <p className="hero__tagline">{hero.tagline}</p>
          <h1 className="hero__name">{hero.name}</h1>
          <p className="hero__title">{hero.title}</p>
          <p className="hero__summary">{hero.summary}</p>

          <div className="hero__actions">
            {primaryActions.length > 0 ? (
              <div className="hero__actions-row">
                {primaryActions.map((action) => (
                  <BaseLink
                    key={action.href}
                    href={action.href}
                    className={getActionClass(action.variant)}
                  >
                    {action.label}
                  </BaseLink>
                ))}
              </div>
            ) : null}
            {secondaryActions.length > 0 ? (
              <div className="hero__actions-row hero__actions-row--stacked">
                {secondaryActions.map((action) => (
                  <BaseLink
                    key={action.href}
                    href={action.href}
                    className={`${getActionClass(action.variant)} hero__action--stacked`}
                  >
                    {action.label}
                  </BaseLink>
                ))}
              </div>
            ) : null}
          </div>

          <p className="hero__availability">{hero.availability}</p>
        </div>

        <div className="hero__meta" data-animate>
          <div className="hero__portrait">
            <Image
              src={portraitSrc}
              alt={`Potret ${hero.name}`}
              fill
              priority
              sizes="(max-width: 720px) 70vw, (max-width: 960px) 40vw, 320px"
              className="hero__portrait-image"
            />
            <div className="hero__portrait-glow" aria-hidden="true" />
          </div>

          <ul className="hero__highlights">
            {hero.highlights.map((highlight) => (
              <li key={highlight.label}>
                <span className="hero__highlight-label">{highlight.label}</span>
                <span className="hero__highlight-value">{highlight.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

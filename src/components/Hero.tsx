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

  return (
    <section className="hero">
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
        <div className="hero__info">
          <p className="hero__tagline">{hero.tagline}</p>
          <h1 className="hero__name">{hero.name}</h1>
          <p className="hero__title">{hero.title}</p>
          <p className="hero__summary">{hero.summary}</p>

          <div className="hero__actions">
            {hero.actions.map((action) => (
              <BaseLink
                key={action.href}
                href={action.href}
                className={getActionClass(action.variant)}
              >
                {action.label}
              </BaseLink>
            ))}
          </div>

          <p className="hero__availability">{hero.availability}</p>
        </div>

        <div className="hero__meta">
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

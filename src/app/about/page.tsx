import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import Timeline from "@/components/Timeline";
import TestimonialsDeck from "@/components/TestimonialsDeck";
import { loadAboutContent } from "@/content/about";
import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function AboutPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const aboutContent = loadAboutContent(language);
  const { nextStepsHeading, navLabels } = dictionary;
  const { hero, philosophy, story, timeline, capabilities, values, testimonials } = aboutContent;

  return (
    <div className="about">
      <section className="about__hero" data-animate>
        <h1 className="h1">{hero.title}</h1>
        <p className="about__tagline">{hero.tagline}</p>
        <p className="sub about__summary">{hero.summary}</p>
      </section>

      <section className="about__section" data-animate>
        <h2 className="h2">{philosophy.heading}</h2>
        <div className="about__story card">
          {[...philosophy.paragraphs, ...(philosophy.secondary ?? [])].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="about__section" data-animate>
        <h2 className="h2">{story.heading}</h2>
        <div className="about__story card">
          {story.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="about__section" data-animate>
        <h2 className="h2">{timeline.heading}</h2>
        <Timeline items={timeline.items} />
      </section>

      <section className="about__section" data-animate>
        <h2 className="h2">{capabilities.heading}</h2>
        <CapabilitiesGrid clusters={capabilities.clusters} />
      </section>

      <section className="about__section" data-animate>
        <h2 className="h2">{values.heading}</h2>
        <div className="about__values">
          {values.items.map((item) => (
            <article key={item.title} className="about__value card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {testimonials.items.length > 0 && testimonials.heading && (
        <section className="about__section" data-animate>
          <h2 className="h2">{testimonials.heading}</h2>
          <TestimonialsDeck items={testimonials.items} cta={testimonials.cta} />
        </section>
      )}

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="about" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

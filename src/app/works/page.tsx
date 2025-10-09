import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function WorksPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { works, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="works" data-animate>
      <h1 className="h1">{works.title}</h1>
      <p className="sub">{works.intro}</p>

      <div className="nav" style={{ margin: "12px 0 18px 0" }} data-animate>
        {works.buttons.map((button) => (
          <a key={button.label} className="pill" href={button.href} target="_blank" rel="noopener">
            {button.label}
          </a>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: "6px" }} data-animate>
        {works.gallery.map((item) => (
          <a key={item.title} className="card" href={item.href} target="_blank" rel="noopener">
            <div className="k">{item.title}</div>
            <div className="sub">{item.sub}</div>
          </a>
        ))}
      </div>

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="works" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

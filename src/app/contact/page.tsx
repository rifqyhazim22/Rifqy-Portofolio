import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";

export default async function ContactPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { contact, nextStepsHeading, navLabels } = dictionary;

  return (
    <div>
      <h1 className="h1">{contact.title}</h1>
      {contact.intro && <p className="sub" style={{ marginTop: "8px" }}>{contact.intro}</p>}
      <div className="grid grid-2" style={{ marginTop: "14px" }}>
        {contact.contacts.map((item) => (
          <a key={item.title} className="card" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener" : undefined}>
            <div className="k">{item.title}</div>
            <div className="sub">{item.sub}</div>
          </a>
        ))}
      </div>

      <hr />

      <section>
        <h2 className="h2">{contact.faqHeading}</h2>
        <div className="grid" style={{ marginTop: "10px" }}>
          {contact.faq.map((item) => (
            <div className="card" key={item.title}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <hr />

      <NextSteps current="contact" heading={nextStepsHeading} navLabels={navLabels} />
    </div>
  );
}

import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { contact, nextStepsHeading, navLabels } = dictionary;

  return (
    <div className="contact">
      <h1 className="h1">{contact.title}</h1>
      {contact.intro && <p className="sub" style={{ marginTop: "8px" }}>{contact.intro}</p>}
      {contact.promo ? (
        <section className="card contact__promo" data-animate>
          <div className="contact__promo-title">{contact.promo.title}</div>
          <p className="sub contact__promo-text">{contact.promo.body}</p>
          <div className="contact__promo-actions">
            <a className="pill" href={contact.promo.buttonHref} target="_blank" rel="noopener">
              {contact.promo.buttonLabel}
            </a>
          </div>
        </section>
      ) : null}
      <div className="grid grid-2" style={{ marginTop: "14px" }} data-animate>
        {contact.contacts.map((item) => (
          <a key={item.title} className="card" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener" : undefined}>
            <div className="k">{item.title}</div>
            <div className="sub">{item.sub}</div>
          </a>
        ))}
      </div>

      <ContactForm language={language} />

      <div className="hr" data-animate />

      {contact.downloads && contact.downloads.length > 0 ? (
        <>
          <section data-animate>
            <h2 className="h2">{contact.downloadsHeading}</h2>
            {contact.downloadsNote ? <p className="sub">{contact.downloadsNote}</p> : null}
            <div className="grid grid-3" style={{ marginTop: "12px" }}>
              {contact.downloads.map((item) => (
                <a key={item.title} className="card" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener" : undefined}>
                  <div className="k">{item.title}</div>
                  <div className="sub">{item.sub}</div>
                </a>
              ))}
            </div>
          </section>

          <div className="hr" data-animate />
        </>
      ) : null}

      <section data-animate>
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

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="contact" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

import type { IndustryDetail } from "@/i18n/types";
import BaseLink from "./BaseLink";

interface IndustryDetailContentProps {
  detail: IndustryDetail;
  backHref: string;
  backLabel: string;
}

export default function IndustryDetailContent({ detail, backHref, backLabel }: IndustryDetailContentProps) {
  return (
    <div className="industry-detail" data-animate>
      <BaseLink className="pill" href={backHref}>
        {backLabel}
      </BaseLink>
      <h1 className="h1" style={{ marginTop: "10px" }}>
        {detail.title}
      </h1>
      <p className="sub" style={{ marginBottom: "14px" }}>
        {detail.intro}
      </p>

      <div className="grid grid-2" data-animate>
        <div className="card">
          <h2 className="h3">{detail.mindsetHeading}</h2>
          <p className="sub" style={{ margin: 0 }}>{detail.mindsetBody}</p>
        </div>
        <div className="card">
          <h2 className="h3">{detail.examplesHeading}</h2>
          <div className="industry-detail__list">
            {detail.examples.map((item) => (
              <div key={item.title} className="industry-detail__item">
                <div className="k">{item.title}</div>
                <div className="sub">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="industry-detail__actions" data-animate>
        <h2 className="h2">{detail.actionsHeading}</h2>
        <div className="grid grid-2">
          {detail.actions.map((item) => (
            <div className="card" key={item.title}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

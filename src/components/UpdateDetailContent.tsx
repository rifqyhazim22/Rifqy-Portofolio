import BaseLink from "./BaseLink";
import type { UpdateDetail } from "@/i18n/types";

interface UpdateDetailContentProps {
  detail: UpdateDetail;
  backHref: string;
  backLabel: string;
  dateLabel: string;
}

export default function UpdateDetailContent({ detail, backHref, backLabel, dateLabel }: UpdateDetailContentProps) {
  return (
    <div>
      <BaseLink className="pill" href={backHref}>
        {backLabel}
      </BaseLink>
      <h1 className="h1" style={{ marginTop: "10px" }}>
        {detail.title}
      </h1>
      <p className="sub" style={{ marginBottom: "12px" }}>
        {dateLabel}: {detail.date}
      </p>

      <div className="card">
        <p className="sub" style={{ margin: 0 }}>
          {detail.intro}
        </p>
      </div>

      {detail.grids?.map((grid) => (
        <section key={grid.heading}>
          <h2 className="h2" style={{ marginTop: "16px" }}>
            {grid.heading}
          </h2>
          <div className="grid grid-2">
            {grid.items.map((item) => (
              <div className="card" key={`${grid.heading}-${item.title}`}>
                <div className="k">{item.title}</div>
                <div className="sub">{item.sub}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {detail.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="h2" style={{ marginTop: "16px" }}>
            {section.heading}
          </h2>
          <div className="card">
            <p className="sub" style={{ margin: 0 }}>{section.body}</p>
          </div>
        </section>
      ))}
    </div>
  );
}

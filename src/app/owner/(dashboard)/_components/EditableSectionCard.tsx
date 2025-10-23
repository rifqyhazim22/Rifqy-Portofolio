"use client";

import { useMemo, useState, useTransition } from "react";
import { updateSiteSectionAction } from "../actions";

export type SiteSection = {
  id: string;
  slug: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  status: "draft" | "published" | null;
  updated_at: string | null;
};

type EditableSectionCardProps = {
  section: SiteSection;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "Never";
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(new Date(iso));
  } catch {
    return iso;
  }
};

export const EditableSectionCard = ({ section }: EditableSectionCardProps) => {
  const [title, setTitle] = useState(section.title ?? "");
  const [body, setBody] = useState(section.body ?? "");
  const [status, setStatus] = useState<"draft" | "published">(section.status ?? "draft");
  const [metadataJson, setMetadataJson] = useState(
    section.metadata ? JSON.stringify(section.metadata, null, 2) : "",
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const metadataPlaceholder = useMemo(
    () => `{
  "heroImage": "/images/hero.png",
  "ctaLabel": "Let's talk"
}`,
    [],
  );

  const handleSubmit = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await updateSiteSectionAction({
          id: section.id,
          title,
          body,
          metadataJson: metadataJson.trim() ? metadataJson : null,
          status: status as "draft" | "published",
        });
        setFeedback("Changes saved");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to save section");
      }
    });
  };

  return (
    <article className="owner-panel owner-panel--section">
      <header className="owner-panel__section-header">
        <div className="owner-panel__section-labels">
          <span className="owner-panel__slug">{section.slug}</span>
          <h3>{title || "Untitled section"}</h3>
        </div>
        <div className="owner-panel__section-controls">
          <label className="owner-panel__field owner-panel__field--compact">
            <span>Status</span>
            <select
              value={status ?? "draft"}
              onChange={(event) => setStatus(event.target.value as "draft" | "published")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <span className="owner-panel__hint">Updated {formatDate(section.updated_at)}</span>
        </div>
      </header>

      <div className="owner-panel__body owner-panel__grid owner-panel__grid--section">
        <label className="owner-panel__field">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Section title"
          />
        </label>

        <label className="owner-panel__field owner-panel__field--mono">
          <span>Metadata (JSON)</span>
          <textarea
            value={metadataJson}
            onChange={(event) => setMetadataJson(event.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={metadataPlaceholder}
          />
        </label>

        <label className="owner-panel__field owner-panel__field--full">
          <span>Body</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={6}
            placeholder="Narrative, markdown, or HTML snippet"
          />
        </label>
      </div>

      <footer className="owner-panel__footer">
        <div>
          {feedback && <span className="owner-panel__feedback">{feedback}</span>}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="owner-panel__primary"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </footer>
    </article>
  );
};

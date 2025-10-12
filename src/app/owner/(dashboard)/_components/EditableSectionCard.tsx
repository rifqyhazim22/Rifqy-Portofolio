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
  const [status, setStatus] = useState<"draft" | "published">(
    section.status ?? "draft",
  );
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
        setFeedback("Saved");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to save section",
        );
      }
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/50">
            {section.slug}
          </p>
          <h2 className="text-xl font-semibold text-white">
            {title || "Untitled section"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-white/60">
            Status
            <select
              value={status ?? "draft"}
              onChange={(event) =>
                setStatus(event.target.value as "draft" | "published")
              }
              className="mt-1 block w-full rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <span className="text-xs text-white/40">
            Updated: {formatDate(section.updated_at)}
          </span>
        </div>
      </header>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-white/70">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Section title"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-white/70">
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={6}
            placeholder="Narrative, markdown, or HTML snippet"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-white/70">
          Metadata (JSON)
          <textarea
            value={metadataJson}
            onChange={(event) => setMetadataJson(event.target.value)}
            rows={5}
            spellCheck={false}
            placeholder={metadataPlaceholder}
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <footer className="mt-5 flex items-center justify-between gap-4">
        <div className="text-sm text-white/50">
          {feedback && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {feedback}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </footer>
    </section>
  );
};

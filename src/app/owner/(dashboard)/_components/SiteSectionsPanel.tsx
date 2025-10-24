"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSiteSectionAction, updateSiteSectionAction } from "../actions";

export type SiteSection = {
  id: string;
  slug: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  status: "draft" | "published" | null;
  updated_at: string | null;
};

type SiteSectionsPanelProps = {
  sections: SiteSection[];
};

const DEFAULT_EDITOR_STATE = {
  title: "",
  body: "",
  metadataJson: "",
  status: "draft" as "draft" | "published",
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const SiteSectionsPanel = ({ sections }: SiteSectionsPanelProps) => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(sections[0]?.id ?? null);
  const [editorState, setEditorState] = useState(() => {
    const first = sections[0];
    return first
      ? {
          title: first.title ?? "",
          body: first.body ?? "",
          metadataJson: first.metadata ? JSON.stringify(first.metadata, null, 2) : "",
          status: (first.status ?? "draft") as "draft" | "published",
        }
      : DEFAULT_EDITOR_STATE;
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = sections.filter((item) => item.status === "published").length;
    return {
      total: sections.length,
      published,
      draft: sections.length - published,
    };
  }, [sections]);

  const selectedSection = useMemo(
    () => sections.find((item) => item.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const handleSelect = (sectionId: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    setSelectedId(section.id);
    setEditorState({
      title: section.title ?? "",
      body: section.body ?? "",
      metadataJson: section.metadata ? JSON.stringify(section.metadata, null, 2) : "",
      status: (section.status ?? "draft") as "draft" | "published",
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedSection) {
      setFeedback("Pilih section terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      try {
        await updateSiteSectionAction({
          id: selectedSection.id,
          title: editorState.title,
          body: editorState.body,
          metadataJson: editorState.metadataJson.trim() ? editorState.metadataJson : null,
          status: editorState.status,
        });
        setFeedback("Section updated");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update section");
      }
    });
  };

  const handleCreate = () => {
    const slug = prompt("Slug baru untuk content block?");
    if (!slug) return;

    startTransition(async () => {
      try {
        await createSiteSectionAction(slug);
        setFeedback("Content block created");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to create block");
      }
    });
  };

  return (
    <section className="owner-story-card">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Content blocks</h3>
          <p>Atur narasi halaman—judul, body, dan metadata yang langsung tersaji di frontend.</p>
        </div>
        <div className="owner-story-card__header-actions">
          <div className="owner-story-card__metrics" aria-label="Content blocks overview">
            <article>
              <span>Total</span>
              <strong>{totals.total}</strong>
            </article>
            <article>
              <span>Published</span>
              <strong>{totals.published}</strong>
            </article>
            <article>
              <span>Drafts</span>
              <strong>{totals.draft}</strong>
            </article>
          </div>
          <button
            type="button"
            className="owner-story-card__button"
            onClick={handleCreate}
            disabled={isPending}
          >
            <span aria-hidden>＋</span>
            New block
          </button>
        </div>
      </header>

      <div
        className={`owner-story-card__body ${
          sections.length === 0 ? "owner-story-card__body--solo" : ""
        }`}
      >
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(section.id)}
                  className={`owner-story-card__item ${
                    selectedId === section.id ? "owner-story-card__item--active" : ""
                  }`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{section.title ?? section.slug}</strong>
                    <small>{section.slug}</small>
                    <div className="owner-story-card__item-meta">
                      <span>Updated {formatTimestamp(section.updated_at) ?? "never"}</span>
                    </div>
                  </div>
                  <span
                    className={`owner-story-card__badge owner-story-card__badge--${(
                      section.status ?? "draft"
                    ).toLowerCase()}`}
                  >
                    {section.status === "published" ? "Published" : "Draft"}
                  </span>
                </button>
              </li>
            ))}
            {!sections.length && (
              <li className="owner-story-card__empty-block">
                <h4>Belum ada content block</h4>
                <p>
                  Klik <strong>New block</strong> untuk menambahkan slug baru, lalu isi judul, body,
                  dan metadata yang dibaca frontend.
                </p>
                <ul>
                  <li>Slug memetakan block ke komponen halaman.</li>
                  <li>Status <strong>Published</strong> akan langsung tampil di website.</li>
                </ul>
              </li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedSection ? selectedSection.slug : "Pilih section"}</span>
            {selectedSection?.updated_at ? (
              <time>{formatTimestamp(selectedSection.updated_at)}</time>
            ) : null}
          </div>

          {selectedSection ? (
            <>
              <div className="owner-story-card__section">
                <h4>Judul & Status</h4>
                <div className="owner-story-card__grid owner-story-card__grid--two">
                  <label className="owner-panel__field">
                    <span>Title</span>
                    <input
                      value={editorState.title}
                      onChange={(event) =>
                        setEditorState((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Section title"
                    />
                  </label>
                  <label className="owner-panel__field">
                    <span>Status</span>
                    <select
                      value={editorState.status}
                      onChange={(event) =>
                        setEditorState((prev) => ({
                          ...prev,
                          status: event.target.value as "draft" | "published",
                        }))
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="owner-story-card__section">
                <h4>Body copy</h4>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Body</span>
                  <textarea
                    value={editorState.body}
                    onChange={(event) =>
                      setEditorState((prev) => ({ ...prev, body: event.target.value }))
                    }
                    rows={6}
                    placeholder="Markdown / HTML copy"
                  />
                </label>
              </div>

              <div className="owner-story-card__section">
                <h4>Metadata JSON</h4>
                <p className="owner-story-card__hint">
                  Gunakan metadata untuk mengatur headline hero, CTA, atau konfigurasi lain yang
                  dibaca frontend.
                </p>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Metadata</span>
                  <textarea
                    value={editorState.metadataJson}
                    onChange={(event) =>
                      setEditorState((prev) => ({ ...prev, metadataJson: event.target.value }))
                    }
                    rows={6}
                    spellCheck={false}
                    placeholder={`{
  "heroHeadline": "Title",
  "ctaLabel": "Hubungi kami"
}`}
                    className="font-mono text-sm"
                  />
                </label>
              </div>

              <footer className="owner-story-card__footer">
                {feedback && <span className="owner-story-card__feedback">{feedback}</span>}
                <div className="owner-story-card__actions">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="owner-panel__primary"
                  >
                    {isPending ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <p className="owner-story-card__empty">Pilih section untuk diedit.</p>
          )}
        </div>
      </div>
    </section>
  );
};

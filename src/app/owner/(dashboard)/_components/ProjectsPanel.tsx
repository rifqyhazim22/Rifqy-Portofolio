"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  deleteProjectAction,
  upsertProjectAction,
} from "../actions";

export type ProjectRecord = {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  slug: string | null;
  link_url: string | null;
  hero_image_url: string | null;
  tags: string[] | null;
  display_order: number | null;
  is_featured: boolean | null;
  status: "draft" | "published" | null;
  updated_at: string | null;
};

type ProjectsPanelProps = {
  projects: ProjectRecord[];
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

const useProjectState = (records: ProjectRecord[]) => {
  const first = records[0];
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const [formState, setFormState] = useState(() => ({
    title: first?.title ?? "",
    slug: first?.slug ?? "",
    link_url: first?.link_url ?? "",
    tagline: first?.tagline ?? "",
    hero_image_url: first?.hero_image_url ?? "",
    description: first?.description ?? "",
    tags: first?.tags ?? [],
    display_order: first?.display_order ?? 0,
    status: (first?.status ?? "draft") as "draft" | "published",
    is_featured: Boolean(first?.is_featured),
  }));

  const select = (recordId: string | null) => {
    if (!recordId) {
      setSelectedId(null);
      setFormState({
        title: "",
        slug: "",
        link_url: "",
        tagline: "",
        hero_image_url: "",
        description: "",
        tags: [],
        display_order: 0,
        status: "draft",
        is_featured: false,
      });
      return;
    }

    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    setSelectedId(record.id);
    setFormState({
      title: record.title ?? "",
      slug: record.slug ?? "",
      link_url: record.link_url ?? "",
      tagline: record.tagline ?? "",
      hero_image_url: record.hero_image_url ?? "",
      description: record.description ?? "",
      tags: record.tags ?? [],
      display_order: record.display_order ?? 0,
      status: (record.status ?? "draft") as "draft" | "published",
      is_featured: Boolean(record.is_featured),
    });
  };

  return { selectedId, formState, setFormState, select };
};

const EmptyListPlaceholder = () => (
  <li className="owner-story-card__empty-block">
    <h4>Belum ada project</h4>
    <p>Cara tercepat untuk memulai:</p>
    <ul>
      <li>Klik “New project” untuk menambahkan studi kasus.</li>
      <li>Gunakan order & tag untuk mengatur urutan tampil di website.</li>
    </ul>
  </li>
);

export const ProjectsPanel = ({ projects }: ProjectsPanelProps) => {
  const router = useRouter();
  const { selectedId, formState, setFormState, select } = useProjectState(projects);
  const isEmpty = projects.length === 0;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = projects.filter((item) => item.status === "published").length;
    return {
      total: projects.length,
      published,
      draft: projects.length - published,
    };
  }, [projects]);

  const selected = useMemo(
    () => projects.find((item) => item.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      setFeedback("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        await upsertProjectAction({
          id: selectedId ?? undefined,
          title: formState.title.trim(),
          slug: formState.slug?.trim() || undefined,
          linkUrl: formState.link_url?.trim() || undefined,
          tagline: formState.tagline || undefined,
          description: formState.description || undefined,
          heroImageUrl: formState.hero_image_url || undefined,
          tags: formState.tags || undefined,
          displayOrder: formState.display_order ?? undefined,
          isFeatured: formState.is_featured,
          status: formState.status,
        });
        setFeedback(selectedId ? "Project updated" : "Project created");
        if (!selectedId) {
          select(null);
        }
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to save project");
      }
    });
  };

  const handleDelete = (id: string | null) => {
    if (!id || !confirm("Delete this project?")) return;
    startTransition(async () => {
      try {
        await deleteProjectAction(id);
        setFeedback("Project deleted");
        select(projects.find((item) => item.id !== id)?.id ?? null);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to delete project");
      }
    });
  };

  const tagsValue = (formState.tags ?? []).join(", ");

  return (
    <section className="owner-story-card owner-story-card--wide">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Projects</h3>
          <p>Kurasi studi kasus yang tampil di halaman publik.</p>
        </div>
        <div className="owner-story-card__header-actions">
          <div className="owner-story-card__metrics" aria-label="Project overview">
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
          <button type="button" className="owner-story-card__button" onClick={() => select(null)}>
            <span aria-hidden>＋</span>
            New project
          </button>
        </div>
      </header>

      <div className={`owner-story-card__body ${isEmpty ? "owner-story-card__body--solo" : ""}`}>
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => select(project.id)}
                  className={`owner-story-card__item ${
                    selectedId === project.id ? "owner-story-card__item--active" : ""
                  }`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{project.title}</strong>
                    <small>{project.tagline ?? "Belum ada tagline"}</small>
                    <div className="owner-story-card__item-meta">
                      {project.slug ? <code>{project.slug}</code> : <span>Slug pending</span>}
                      {project.display_order !== null && project.display_order !== undefined ? (
                        <span>Order #{project.display_order}</span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`owner-story-card__badge owner-story-card__badge--${(
                      project.status ?? "draft"
                    ).toLowerCase()}`}
                  >
                    {project.status === "published" ? "Published" : "Draft"}
                  </span>
                </button>
              </li>
            ))}
            {!projects.length && <EmptyListPlaceholder />}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedId ? "Edit project" : "Project baru"}</span>
            {selected?.updated_at ? <time>{formatTimestamp(selected.updated_at)}</time> : null}
          </div>

          <div className="owner-story-card__section">
            <h4>Identitas</h4>
            <div className="owner-story-card__grid owner-story-card__grid--three">
              <label className="owner-panel__field">
                <span>Title</span>
                <input
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Project title"
                />
              </label>
              <label className="owner-panel__field">
                <span>Slug</span>
                <input
                  value={formState.slug ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  placeholder="e.g. marketing-automation"
                />
              </label>
              <label className="owner-panel__field">
                <span>External link</span>
                <input
                  value={formState.link_url ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, link_url: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
            </div>
          </div>

          <div className="owner-story-card__section">
            <h4>Deskripsi</h4>
            <div className="owner-story-card__grid owner-story-card__grid--two">
              <label className="owner-panel__field">
                <span>Tagline</span>
                <input
                  value={formState.tagline ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tagline: event.target.value }))
                  }
                  placeholder="Quick hook for the project"
                />
              </label>
              <label className="owner-panel__field">
                <span>Hero asset</span>
                <input
                  value={formState.hero_image_url ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, hero_image_url: event.target.value }))
                  }
                  placeholder="/images/project-x.png atau pilih dari Assets"
                />
              </label>
            </div>
            <label className="owner-panel__field owner-story-card__field--wide">
              <span>Description</span>
              <textarea
                value={formState.description ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={4}
                placeholder="Ringkasan deliverable, proses, atau hasil"
              />
            </label>
          </div>

          <div className="owner-story-card__section">
            <h4>Publishing</h4>
            <p className="owner-story-card__hint">
              Tag membentuk filter di halaman public. Display order menentukan urutan muncul.
            </p>
            <label className="owner-panel__field owner-story-card__field--wide">
              <span>Tags (comma separated)</span>
              <input
                value={tagsValue}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="AI, Automation, Product"
              />
            </label>
            <div className="owner-story-card__grid owner-story-card__grid--two">
              <label className="owner-panel__field">
                <span>Display order</span>
                <input
                  type="number"
                  value={formState.display_order ?? 0}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      display_order: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="owner-panel__field">
                <span>Status</span>
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((prev) => ({
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
            <label className="owner-panel__checkbox owner-story-card__field--wide">
              <input
                type="checkbox"
                checked={Boolean(formState.is_featured)}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_featured: event.target.checked,
                  }))
                }
              />
              <span>Featured</span>
            </label>
          </div>

          <footer className="owner-story-card__footer">
            {feedback && <span className="owner-story-card__feedback">{feedback}</span>}
            <div className="owner-story-card__actions">
              {selectedId && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedId)}
                  disabled={isPending}
                  className="owner-panel__secondary owner-panel__secondary--danger"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="owner-panel__primary"
              >
                {isPending ? "Saving…" : selectedId ? "Update project" : "Create project"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};

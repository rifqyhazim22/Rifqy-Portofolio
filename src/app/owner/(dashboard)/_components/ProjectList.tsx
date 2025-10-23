"use client";

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

type ProjectListProps = {
  projects: ProjectRecord[];
};

const DEFAULT_PROJECT: Partial<ProjectRecord> = {
  title: "",
  tagline: "",
  description: "",
  slug: "",
  link_url: "",
  hero_image_url: "",
  tags: [],
  display_order: 0,
  is_featured: false,
  status: "draft",
};

const formatStatus = (status: "draft" | "published" | null | undefined) =>
  status === "published" ? "Published" : "Draft";

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

export const ProjectList = ({ projects }: ProjectListProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<ProjectRecord>>(DEFAULT_PROJECT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = projects.filter((project) => project.status === "published").length;
    return {
      total: projects.length,
      published,
      draft: projects.length - published,
    };
  }, [projects]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const resetForm = () => {
    setSelectedId(null);
    setFormState(DEFAULT_PROJECT);
    setFeedback(null);
  };

  const handleSelect = (projectId: string) => {
    const record = projects.find((item) => item.id === projectId);
    if (!record) return;
    setSelectedId(record.id);
    setFormState({
      ...record,
      tags: record.tags ?? [],
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!formState.title?.trim()) {
      setFeedback("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        await upsertProjectAction({
          id: selectedId ?? undefined,
          title: formState.title!.trim(),
          tagline: formState.tagline ?? undefined,
          description: formState.description ?? undefined,
          slug: formState.slug ?? undefined,
          linkUrl: formState.link_url ?? undefined,
          heroImageUrl: formState.hero_image_url ?? undefined,
          tags: formState.tags ?? undefined,
          displayOrder: formState.display_order ?? undefined,
          isFeatured: Boolean(formState.is_featured),
          status: (formState.status as "draft" | "published") ?? "draft",
        });

        setFeedback(selectedId ? "Project updated" : "Project created");
        if (!selectedId) {
          resetForm();
        }
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to save project",
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteProjectAction(id);
        setFeedback("Project deleted");
        if (selectedId === id) {
          resetForm();
        }
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to delete project",
        );
      }
    });
  };

  const actionLabel = selectedId ? "Reset form" : "New project";

  return (
    <section className="owner-story-card">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Projects</h3>
          <p>Kurasi studi kasus utama dan link portofolio detail.</p>
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
          <button type="button" onClick={resetForm} className="owner-story-card__button">
            <span aria-hidden>＋</span>
            {actionLabel}
          </button>
        </div>
      </header>

      <div className="owner-story-card__body">
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(project.id)}
                  className={`owner-story-card__item ${
                    selectedId === project.id ? "owner-story-card__item--active" : ""
                  }`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{project.title}</strong>
                    <small>{project.tagline ?? "Tagline belum ditulis"}</small>
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
                    {formatStatus(project.status)}
                  </span>
                </button>
              </li>
            ))}
            {!projects.length && (
              <li className="owner-story-card__empty">Belum ada project yang dibuat.</li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedId ? "Edit project" : "Buat project baru"}</span>
            {selectedProject?.updated_at ? (
              <time>{formatTimestamp(selectedProject.updated_at)}</time>
            ) : null}
          </div>

          <div className="owner-story-card__grid owner-story-card__grid--three">
            <label className="owner-panel__field">
              <span>Title</span>
              <input
                value={formState.title ?? ""}
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
              <span>Hero image URL</span>
              <input
                value={formState.hero_image_url ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, hero_image_url: event.target.value }))
                }
                placeholder="/images/project-x.png"
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
              placeholder="Longer write-up or Markdown"
            />
          </label>

          <label className="owner-panel__field owner-story-card__field--wide">
            <span>Tags (comma separated)</span>
            <input
              value={(formState.tags ?? []).join(", ")}
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

          <div className="owner-story-card__grid owner-story-card__grid--three">
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
                value={formState.status ?? "draft"}
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
            <label className="owner-panel__checkbox">
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
                {isPending
                  ? "Saving…"
                  : selectedId
                    ? "Update project"
                    : "Create project"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};

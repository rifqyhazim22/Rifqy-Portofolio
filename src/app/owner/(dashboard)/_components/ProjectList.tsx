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

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const totalPublished = useMemo(
    () => projects.filter((project) => project.status === "published").length,
    [projects],
  );
  const totalDraft = useMemo(
    () => projects.filter((project) => project.status !== "published").length,
    [projects],
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

  const activeLabel = selectedId ? "Reset form" : "New project";

  return (
    <section className="owner-panel owner-panel--manager">
      <div className="owner-manager__hero">
        <div className="owner-manager__title">
          <h3>Projects</h3>
          <p>Kurasi studi kasus utama dan link portofolio detail.</p>
        </div>
        <div className="owner-manager__summary">
          <article>
            <span>Total</span>
            <strong>{projects.length}</strong>
          </article>
          <article>
            <span>Published</span>
            <strong>{totalPublished}</strong>
          </article>
          <article>
            <span>Drafts</span>
            <strong>{totalDraft}</strong>
          </article>
        </div>
        <button type="button" onClick={resetForm} className="owner-manager__add">
          <span aria-hidden>＋</span>
          {activeLabel}
        </button>
      </div>

      <div className="owner-manager">
        <aside className="owner-manager__list">
          <div className="owner-manager__list-head">
            <span>Entries</span>
            <span className="owner-manager__count">{projects.length}</span>
          </div>
          <ul className="owner-manager__items">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(project.id)}
                  className={`owner-manager__item ${
                    selectedId === project.id ? "owner-manager__item--active" : ""
                  }`}
                >
                  <div className="owner-manager__item-main">
                    <strong>{project.title}</strong>
                    {project.tagline ? <span>{project.tagline}</span> : null}
                    <div className="owner-manager__item-meta">
                      {project.slug ? <code>{project.slug}</code> : <span>Slug pending</span>}
                      {project.display_order !== null &&
                      project.display_order !== undefined ? (
                        <span>Order #{project.display_order}</span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`owner-manager__status owner-manager__status--${(project.status ?? "draft").toLowerCase()}`}
                  >
                    {formatStatus(project.status)}
                  </span>
                </button>
              </li>
            ))}
            {!projects.length && (
              <li className="owner-manager__empty">No projects yet</li>
            )}
          </ul>
        </aside>

        <div className="owner-manager__form">
          <div className="owner-manager__legend">
            <span>{selectedId ? "Edit project" : "Buat project baru"}</span>
            {selectedProject?.updated_at ? (
              <time className="owner-manager__timestamp">
                Updated {formatTimestamp(selectedProject.updated_at)}
              </time>
            ) : null}
          </div>

          <div className="owner-manager__grid owner-manager__grid--three">
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

          <div className="owner-manager__grid owner-manager__grid--two">
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

          <label className="owner-panel__field owner-manager__field--wide">
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

          <label className="owner-panel__field owner-manager__field--wide">
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

          <div className="owner-manager__grid owner-manager__grid--three">
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
            <label className="owner-panel__checkbox owner-manager__checkbox">
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

          <footer className="owner-manager__footer">
            {feedback && (
              <span className="owner-manager__feedback">{feedback}</span>
            )}
            <div className="owner-manager__actions">
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

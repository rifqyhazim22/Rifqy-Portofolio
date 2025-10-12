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

export const ProjectList = ({ projects }: ProjectListProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<ProjectRecord>>(DEFAULT_PROJECT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeProject = useMemo(() => {
    if (!selectedId) return null;
    return projects.find((project) => project.id === selectedId) ?? null;
  }, [projects, selectedId]);

  const resetForm = () => {
    setSelectedId(null);
    setFormState(DEFAULT_PROJECT);
  };

  const handleSelect = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (project) {
      setSelectedId(project.id);
      setFormState({
        ...project,
        tags: project.tags ?? [],
      });
    }
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

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <p className="text-sm text-white/60">
            Reorder via <code className="rounded bg-white/10 px-2 py-0.5">display_order</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          + New project
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <ul className="space-y-2 overflow-auto rounded-xl border border-white/10 bg-slate-950/40 p-3 max-h-[400px]">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => handleSelect(project.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedId === project.id
                    ? "bg-accent/80 text-slate-950"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{project.title}</span>
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    {project.status ?? "draft"}
                  </span>
                </div>
                {project.tagline && (
                  <p className="mt-1 text-xs text-white/70">{project.tagline}</p>
                )}
              </button>
            </li>
          ))}
          {!projects.length && (
            <li className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60">
              No projects yet
            </li>
          )}
        </ul>

        <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-white/70">
            Title
            <input
              value={formState.title ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="Project title"
            />
          </label>
          <label className="text-sm font-medium text-white/70">
            Slug
            <input
              value={formState.slug ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="e.g. marketing-automation"
            />
          </label>
          <label className="text-sm font-medium text-white/70">
            External link
            <input
              value={formState.link_url ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, link_url: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="https://..."
            />
          </label>
        </div>

          <label className="text-sm font-medium text-white/70">
            Tagline
            <input
              value={formState.tagline ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  tagline: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="Quick hook for the project"
            />
          </label>

          <label className="text-sm font-medium text-white/70">
            Description
            <textarea
              value={formState.description ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="Longer write-up or Markdown"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-white/70">
              Hero image URL
              <input
                value={formState.hero_image_url ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    hero_image_url: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="/images/project-x.png"
              />
            </label>
            <label className="text-sm font-medium text-white/70">
              Tags (comma separated)
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
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="AI, Automation, Product"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium text-white/70">
              Display order
              <input
                type="number"
                value={formState.display_order ?? 0}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    display_order: Number(event.target.value ?? 0),
                  }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              />
            </label>

            <label className="text-sm font-medium text-white/70">
              Status
              <select
                value={formState.status ?? "draft"}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: event.target.value as "draft" | "published",
                  }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-white/70">
              <input
                type="checkbox"
                checked={Boolean(formState.is_featured)}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border border-white/10 bg-slate-900 text-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
              Featured
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              {feedback && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  {feedback}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedId && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedId)}
                  disabled={isPending}
                  className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending
                  ? "Saving…"
                  : selectedId
                    ? "Update project"
                    : "Create project"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

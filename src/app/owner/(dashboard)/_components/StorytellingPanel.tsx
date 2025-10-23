"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deleteProjectAction,
  deleteTestimonialAction,
  upsertProjectAction,
  upsertTestimonialAction,
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

export type TestimonialRecord = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  display_order: number | null;
  status: "draft" | "published" | null;
  updated_at: string | null;
};

type StorytellingPanelProps = {
  projects: ProjectRecord[];
  testimonials: TestimonialRecord[];
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

const useTestimonialState = (records: TestimonialRecord[]) => {
  const first = records[0];
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const [formState, setFormState] = useState(() => ({
    name: first?.name ?? "",
    role: first?.role ?? "",
    company: first?.company ?? "",
    quote: first?.quote ?? "",
    avatar_url: first?.avatar_url ?? "",
    display_order: first?.display_order ?? 0,
    status: (first?.status ?? "draft") as "draft" | "published",
  }));

  const select = (recordId: string | null) => {
    if (!recordId) {
      setSelectedId(null);
      setFormState({
        name: "",
        role: "",
        company: "",
        quote: "",
        avatar_url: "",
        display_order: 0,
        status: "draft",
      });
      return;
    }

    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    setSelectedId(record.id);
    setFormState({
      name: record.name ?? "",
      role: record.role ?? "",
      company: record.company ?? "",
      quote: record.quote ?? "",
      avatar_url: record.avatar_url ?? "",
      display_order: record.display_order ?? 0,
      status: (record.status ?? "published") as "draft" | "published",
    });
  };

  return { selectedId, formState, setFormState, select };
};

const ProjectPanel = ({ records }: { records: ProjectRecord[] }) => {
  const { selectedId, formState, setFormState, select } = useProjectState(records);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = records.filter((item) => item.status === "published").length;
    return {
      total: records.length,
      published,
      draft: records.length - published,
    };
  }, [records]);

  const selected = useMemo(
    () => records.find((item) => item.id === selectedId) ?? null,
    [records, selectedId],
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
          tags: formState.tags ?? undefined,
          displayOrder: formState.display_order ?? undefined,
          isFeatured: formState.is_featured,
          status: formState.status,
        });
        setFeedback(selectedId ? "Project updated" : "Project created");
        if (!selectedId) {
          select(null);
        }
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
        select(records.find((item) => item.id !== id)?.id ?? null);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to delete project");
      }
    });
  };

  return (
    <div className="owner-story-card__panel" data-active>
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

      <div className="owner-story-card__body">
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {records.map((project) => (
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
            {!records.length && (
              <li className="owner-story-card__empty">Belum ada project yang tercatat.</li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedId ? "Edit project" : "Project baru"}</span>
            {selected?.updated_at ? <time>{formatTimestamp(selected.updated_at)}</time> : null}
          </div>

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
                {isPending ? "Saving…" : selectedId ? "Update project" : "Create project"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

const TestimonialPanel = ({ records }: { records: TestimonialRecord[] }) => {
  const { selectedId, formState, setFormState, select } = useTestimonialState(records);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = records.filter((item) => item.status === "published").length;
    return {
      total: records.length,
      published,
      draft: records.length - published,
    };
  }, [records]);

  const selected = useMemo(
    () => records.find((item) => item.id === selectedId) ?? null,
    [records, selectedId],
  );

  const handleSubmit = () => {
    if (!formState.name.trim()) {
      setFeedback("Name is required");
      return;
    }
    if (!formState.quote.trim()) {
      setFeedback("Quote cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        await upsertTestimonialAction({
          id: selectedId ?? undefined,
          name: formState.name.trim(),
          role: formState.role || undefined,
          company: formState.company || undefined,
          quote: formState.quote,
          avatarUrl: formState.avatar_url || undefined,
          displayOrder: formState.display_order ?? undefined,
          status: formState.status,
        });
        setFeedback(selectedId ? "Testimonial updated" : "Testimonial created");
        if (!selectedId) {
          select(null);
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to save testimonial");
      }
    });
  };

  const handleDelete = (id: string | null) => {
    if (!id || !confirm("Delete this testimonial?")) return;
    startTransition(async () => {
      try {
        await deleteTestimonialAction(id);
        setFeedback("Testimonial deleted");
        select(records.find((item) => item.id !== id)?.id ?? null);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to delete testimonial");
      }
    });
  };

  return (
    <div className="owner-story-card__panel" data-active>
      <div className="owner-story-card__header-actions">
        <div className="owner-story-card__metrics" aria-label="Testimonial overview">
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
          New testimonial
        </button>
      </div>

      <div className="owner-story-card__body">
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {records.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  className={`owner-story-card__item ${
                    selectedId === item.id ? "owner-story-card__item--active" : ""
                  }`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{item.name}</strong>
                    <small>
                      {[item.role, item.company].filter(Boolean).join(" • ") || "Belum ada detail"}
                    </small>
                    <div className="owner-story-card__item-meta">
                      {item.display_order !== null && item.display_order !== undefined ? (
                        <span>Order #{item.display_order}</span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`owner-story-card__badge owner-story-card__badge--${(
                      item.status ?? "published"
                    ).toLowerCase()}`}
                  >
                    {item.status === "draft" ? "Draft" : "Published"}
                  </span>
                </button>
              </li>
            ))}
            {!records.length && (
              <li className="owner-story-card__empty">Belum ada testimonial yang tercatat.</li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedId ? "Edit testimonial" : "Testimonial baru"}</span>
            {selected?.updated_at ? <time>{formatTimestamp(selected.updated_at)}</time> : null}
          </div>

          <div className="owner-story-card__grid owner-story-card__grid--two">
            <label className="owner-panel__field">
              <span>Name</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Customer name"
              />
            </label>
            <label className="owner-panel__field">
              <span>Role</span>
              <input
                value={formState.role ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, role: event.target.value }))
                }
                placeholder="Title"
              />
            </label>
          </div>

          <label className="owner-panel__field owner-story-card__field--wide">
            <span>Company</span>
            <input
              value={formState.company ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, company: event.target.value }))
              }
              placeholder="Company or affiliation"
            />
          </label>

          <label className="owner-panel__field owner-story-card__field--wide">
            <span>Quote</span>
            <textarea
              value={formState.quote ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, quote: event.target.value }))
              }
              rows={4}
              placeholder="Testimonial content"
            />
          </label>

          <div className="owner-story-card__grid owner-story-card__grid--two">
            <label className="owner-panel__field">
              <span>Avatar URL</span>
              <input
                value={formState.avatar_url ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, avatar_url: event.target.value }))
                }
                placeholder="/images/customer.png"
              />
            </label>
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
          </div>

          <label className="owner-panel__field owner-story-card__field--wide">
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
                    ? "Update testimonial"
                    : "Create testimonial"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export const StorytellingPanel = ({ projects, testimonials }: StorytellingPanelProps) => {
  const [active, setActive] = useState<"projects" | "testimonials">("projects");

  return (
    <section className="owner-story-card owner-story-card--story">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Storytelling assets</h3>
          <p>Kelola studi kasus dan testimoni yang tampil di halaman publik.</p>
        </div>
        <div className="owner-story-card__tabs" role="tablist" aria-label="Storytelling tabs">
          <button
            type="button"
            role="tab"
            aria-selected={active === "projects"}
            className={`owner-story-card__tab ${active === "projects" ? "is-active" : ""}`}
            onClick={() => setActive("projects")}
          >
            Projects
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === "testimonials"}
            className={`owner-story-card__tab ${active === "testimonials" ? "is-active" : ""}`}
            onClick={() => setActive("testimonials")}
          >
            Testimonials
          </button>
        </div>
      </header>

      <div className="owner-story-card__panels">
        <div
          className={`owner-story-card__panel-wrapper ${active === "projects" ? "is-active" : ""}`}
          role="tabpanel"
        >
          <ProjectPanel records={projects} />
        </div>
        <div
          className={`owner-story-card__panel-wrapper ${active === "testimonials" ? "is-active" : ""}`}
          role="tabpanel"
        >
          <TestimonialPanel records={testimonials} />
        </div>
      </div>
    </section>
  );
};

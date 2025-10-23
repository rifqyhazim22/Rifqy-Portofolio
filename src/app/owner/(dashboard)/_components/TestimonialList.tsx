"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deleteTestimonialAction,
  upsertTestimonialAction,
} from "../actions";

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

type TestimonialListProps = {
  testimonials: TestimonialRecord[];
};

const EMPTY_FORM: Partial<TestimonialRecord> = {
  name: "",
  role: "",
  company: "",
  quote: "",
  avatar_url: "",
  display_order: 0,
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

export const TestimonialList = ({ testimonials }: TestimonialListProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<TestimonialRecord>>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const published = testimonials.filter((item) => item.status === "published").length;
    return {
      total: testimonials.length,
      published,
      draft: testimonials.length - published,
    };
  }, [testimonials]);

  const selected = useMemo(
    () => testimonials.find((item) => item.id === selectedId) ?? null,
    [testimonials, selectedId],
  );

  const resetForm = () => {
    setSelectedId(null);
    setFormState(EMPTY_FORM);
    setFeedback(null);
  };

  const handleSelect = (id: string) => {
    const record = testimonials.find((item) => item.id === id);
    if (!record) return;
    setSelectedId(record.id);
    setFormState(record);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!formState.name?.trim()) {
      setFeedback("Name is required");
      return;
    }
    if (!formState.quote?.trim()) {
      setFeedback("Quote cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        await upsertTestimonialAction({
          id: selectedId ?? undefined,
          name: formState.name!.trim(),
          role: formState.role ?? undefined,
          company: formState.company ?? undefined,
          quote: formState.quote!,
          avatarUrl: formState.avatar_url ?? undefined,
          displayOrder: formState.display_order ?? undefined,
          status: (formState.status as "draft" | "published") ?? "published",
        });
        setFeedback(selectedId ? "Testimonial updated" : "Testimonial created");
        if (!selectedId) {
          resetForm();
        }
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to save testimonial",
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    startTransition(async () => {
      try {
        await deleteTestimonialAction(id);
        setFeedback("Testimonial deleted");
        if (selectedId === id) {
          resetForm();
        }
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to delete testimonial",
        );
      }
    });
  };

  const actionLabel = selectedId ? "Reset form" : "New testimonial";

  return (
    <section className="owner-story-card">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Testimonials</h3>
          <p>Kelola social proof untuk diperlihatkan di publik.</p>
        </div>
        <div className="owner-story-card__header-actions">
          <div className="owner-story-card__metrics" aria-label="Testimonials overview">
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
            {testimonials.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`owner-story-card__item ${
                    selectedId === item.id ? "owner-story-card__item--active" : ""
                  }`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{item.name}</strong>
                    <small>
                      {[item.role, item.company].filter(Boolean).join(" • ") || "No role info"}
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
                    {formatStatus(item.status)}
                  </span>
                </button>
              </li>
            ))}
            {!testimonials.length && (
              <li className="owner-story-card__empty">Belum ada testimonial yang tercatat.</li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          <div className="owner-story-card__legend">
            <span>{selectedId ? "Edit testimonial" : "Buat testimonial baru"}</span>
            {selected?.updated_at ? <time>{formatTimestamp(selected.updated_at)}</time> : null}
          </div>

          <div className="owner-story-card__grid owner-story-card__grid--two">
            <label className="owner-panel__field">
              <span>Name</span>
              <input
                value={formState.name ?? ""}
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
    </section>
  );
};

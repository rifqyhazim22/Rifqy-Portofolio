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
  status === "draft" ? "Draft" : "Published";

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

  const selected = useMemo(
    () => testimonials.find((item) => item.id === selectedId) ?? null,
    [testimonials, selectedId],
  );

  const totalPublished = useMemo(
    () => testimonials.filter((item) => item.status === "published").length,
    [testimonials],
  );
  const totalDraft = useMemo(
    () => testimonials.filter((item) => item.status !== "published").length,
    [testimonials],
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

  const ctaLabel = selectedId ? "Reset form" : "New testimonial";

  return (
    <section className="owner-panel owner-panel--manager">
      <div className="owner-manager__hero">
        <div className="owner-manager__title">
          <h3>Testimonials</h3>
          <p>Kelola social proof untuk diperlihatkan di publik.</p>
        </div>
        <div className="owner-manager__summary">
          <article>
            <span>Total</span>
            <strong>{testimonials.length}</strong>
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
          {ctaLabel}
        </button>
      </div>

      <div className="owner-manager">
        <aside className="owner-manager__list">
          <div className="owner-manager__list-head">
            <span>Entries</span>
            <span className="owner-manager__count">{testimonials.length}</span>
          </div>
          <ul className="owner-manager__items">
            {testimonials.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`owner-manager__item ${
                    selectedId === item.id ? "owner-manager__item--active" : ""
                  }`}
                >
                  <div className="owner-manager__item-main">
                    <strong>{item.name}</strong>
                    <span>
                      {[item.role, item.company].filter(Boolean).join(" • ") || "No role info"}
                    </span>
                  </div>
                  <span
                    className={`owner-manager__status owner-manager__status--${(item.status ?? "published").toLowerCase()}`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </button>
              </li>
            ))}
            {!testimonials.length && (
              <li className="owner-manager__empty">No testimonials yet</li>
            )}
          </ul>
        </aside>

        <div className="owner-manager__form">
          <div className="owner-manager__legend">
            <span>{selectedId ? "Edit testimonial" : "Buat testimonial baru"}</span>
            {selected?.updated_at ? (
              <time className="owner-manager__timestamp">
                Updated {formatTimestamp(selected.updated_at)}
              </time>
            ) : null}
          </div>

          <div className="owner-manager__grid owner-manager__grid--two">
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

          <label className="owner-panel__field owner-manager__field--wide">
            <span>Company</span>
            <input
              value={formState.company ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, company: event.target.value }))
              }
              placeholder="Company or affiliation"
            />
          </label>

          <label className="owner-panel__field owner-manager__field--wide">
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

          <div className="owner-manager__grid owner-manager__grid--two">
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

          <label className="owner-panel__field owner-manager__field--wide">
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

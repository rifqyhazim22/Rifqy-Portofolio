"use client";

import { useState, useTransition } from "react";
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

export const TestimonialList = ({ testimonials }: TestimonialListProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<TestimonialRecord>>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  return (
    <section className="owner-panel owner-panel--grid">
      <header>
        <div>
          <h3>Testimonials</h3>
          <p>Kelola social proof untuk diperlihatkan di publik.</p>
        </div>
        <button type="button" onClick={resetForm} className="owner-panel__secondary">
          {selectedId ? "Reset form" : "+ New testimonial"}
        </button>
      </header>

      <div className="owner-panel__body">
        <ul className="owner-panel__list">
          {testimonials.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`owner-panel__list-item ${
                  selectedId === item.id ? "owner-panel__list-item--active" : ""
                }`}
              >
                <div>
                  <span>{item.name}</span>
                  <small>{item.status ?? "draft"}</small>
                </div>
                {(item.role || item.company) ? (
                  <p>{[item.role, item.company].filter(Boolean).join(" • ")}</p>
                ) : null}
              </button>
            </li>
          ))}
          {!testimonials.length && <li className="owner-panel__empty">No testimonials yet</li>}
        </ul>

        <div className="owner-panel__form">
          <div className="owner-panel__grid owner-panel__grid--two">
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

          <label className="owner-panel__field">
            <span>Company</span>
            <input
              value={formState.company ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, company: event.target.value }))
              }
              placeholder="Company or affiliation"
            />
          </label>

          <label className="owner-panel__field">
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

          <div className="owner-panel__grid owner-panel__grid--two">
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

          <div className="owner-panel__footer">
            {feedback && <span>{feedback}</span>}
            <div className="owner-panel__actions">
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
          </div>
        </div>
      </div>
    </section>
  );
};

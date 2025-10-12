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

const emptyForm: Partial<TestimonialRecord> = {
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
  const [formState, setFormState] = useState<Partial<TestimonialRecord>>(
    emptyForm,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setSelectedId(null);
    setFormState(emptyForm);
  };

  const handleSelect = (id: string) => {
    const record = testimonials.find((item) => item.id === id);
    if (record) {
      setSelectedId(record.id);
      setFormState(record);
    }
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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Testimonials</h2>
          <p className="text-sm text-white/60">
            Capture social proof and control publishing state.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          + New testimonial
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <ul className="space-y-2 overflow-auto rounded-xl border border-white/10 bg-slate-950/40 p-3 max-h-[320px]">
          {testimonials.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedId === item.id
                    ? "bg-accent/80 text-slate-950"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    {item.status ?? "draft"}
                  </span>
                </div>
                {(item.role || item.company) && (
                  <p className="mt-1 text-xs text-white/70">
                    {[item.role, item.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </button>
            </li>
          ))}
          {!testimonials.length && (
            <li className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60">
              No testimonials yet
            </li>
          )}
        </ul>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-white/70">
              Name
              <input
                value={formState.name ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="Customer name"
              />
            </label>
            <label className="text-sm font-medium text-white/70">
              Role
              <input
                value={formState.role ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, role: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="Title"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-white/70">
            Company
            <input
              value={formState.company ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, company: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="Company or affiliation"
            />
          </label>

          <label className="text-sm font-medium text-white/70">
            Quote
            <textarea
              value={formState.quote ?? ""}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, quote: event.target.value }))
              }
              rows={4}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              placeholder="Testimonial content"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-white/70">
              Avatar URL
              <input
                value={formState.avatar_url ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    avatar_url: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="/images/customer.png"
              />
            </label>

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
          </div>

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


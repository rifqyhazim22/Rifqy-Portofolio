"use client";

import { useState, useTransition } from "react";
import { createAgentAction } from "./actions";

const DEFAULT_METADATA_BY_TYPE: Record<string, string> = {
  chat: JSON.stringify(
    {
      tonePrompts: {
        formal: "Stay confident and warm but keep sentences short and purposeful.",
        santai: "Keep it light and friendly with brief Indonesian-English phrases; avoid rambling.",
        deep: "Sound reflective yet concise—choose vivid words without adding extra length.",
      },
    },
    null,
    2,
  ),
  librarian: JSON.stringify(
    {
      instructions: {
        intro: {
          id: "Kamu adalah penjaga perpustakaan digital Rifqy Hazim HR—AI librarian yang mengenal CV, portofolio, dan seluruh narasi website.",
          en: "You are the digital librarian for Rifqy Hazim HR—you know his CV, portfolio, and all narratives on the website.",
        },
      },
    },
    null,
    2,
  ),
};

export const CreateAgentPanel = () => {
  const [formState, setFormState] = useState({
    slug: "",
    name: "",
    type: "chat" as "chat" | "librarian" | "other",
    description: "",
    model: "",
    systemPrompt: "",
    metadataJson: DEFAULT_METADATA_BY_TYPE.chat,
  });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTypeChange = (type: "chat" | "librarian" | "other") => {
    setFormState((prev) => ({
      ...prev,
      type,
      metadataJson: DEFAULT_METADATA_BY_TYPE[type] ?? prev.metadataJson,
    }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await createAgentAction(formState);
        setFeedback("Agent created");
        setFormState({
          slug: "",
          name: "",
          type: formState.type,
          description: "",
          model: "",
          systemPrompt: "",
          metadataJson: DEFAULT_METADATA_BY_TYPE[formState.type] ?? "",
        });
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to create agent");
      }
    });
  };

  return (
    <section className="owner-story-card">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Create agent</h3>
          <p>Buat agent baru dengan slug unik dan metadata awal.</p>
        </div>
      </header>
      <div className="owner-story-card__section">
        <div className="owner-story-card__grid owner-story-card__grid--three">
          <label className="owner-panel__field">
            <span>Slug</span>
            <input
              value={formState.slug}
              onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="navigator"
            />
          </label>
          <label className="owner-panel__field">
            <span>Name</span>
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Agent name"
            />
          </label>
          <label className="owner-panel__field">
            <span>Type</span>
            <select
              value={formState.type}
              onChange={(event) => handleTypeChange(event.target.value as "chat" | "librarian" | "other")}
            >
              <option value="chat">Chat</option>
              <option value="librarian">Librarian</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className="owner-panel__field owner-story-card__field--wide">
          <span>Description</span>
          <textarea
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            rows={2}
          />
        </label>
      </div>

      <div className="owner-story-card__section">
        <h4>Model & Prompt</h4>
        <div className="owner-story-card__grid owner-story-card__grid--two">
          <label className="owner-panel__field">
            <span>Model</span>
            <input
              value={formState.model}
              onChange={(event) => setFormState((prev) => ({ ...prev, model: event.target.value }))}
              placeholder="gpt-5-nano"
            />
          </label>
          <label className="owner-panel__field">
            <span>System prompt</span>
            <textarea
              value={formState.systemPrompt}
              onChange={(event) => setFormState((prev) => ({ ...prev, systemPrompt: event.target.value }))}
              rows={4}
              placeholder="Optional system prompt"
            />
          </label>
        </div>
      </div>

      <div className="owner-story-card__section">
        <h4>Metadata JSON</h4>
        <p className="owner-story-card__hint">Kustom instruksi tambahan dalam format JSON. Diperlukan untuk tone prompts atau instructions.</p>
        <label className="owner-panel__field owner-story-card__field--wide">
          <textarea
            value={formState.metadataJson}
            onChange={(event) => setFormState((prev) => ({ ...prev, metadataJson: event.target.value }))}
            rows={8}
            spellCheck={false}
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
            {isPending ? "Creating…" : "Create agent"}
          </button>
        </div>
      </footer>
    </section>
  );
};

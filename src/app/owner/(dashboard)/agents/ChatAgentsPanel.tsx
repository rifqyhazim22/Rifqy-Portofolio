"use client";

import { useMemo, useState, useTransition } from "react";
import type { AiAgentRecord } from "@/lib/supabase/agents";
import { updateChatAgentAction } from "./actions";

const toTonePrompts = (metadata: Record<string, unknown> | null | undefined) => {
  const source = (metadata as Record<string, any>)?.tonePrompts ?? {};
  return {
    formal: typeof source.formal === "string" ? source.formal : "",
    santai: typeof source.santai === "string" ? source.santai : "",
    deep: typeof source.deep === "string" ? source.deep : "",
  };
};

type ChatAgentsPanelProps = {
  agents: AiAgentRecord[];
};

export const ChatAgentsPanel = ({ agents }: ChatAgentsPanelProps) => {
  const first = agents[0] ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialState = useMemo(() => {
    if (!first) {
      return {
        name: "",
        description: "",
        status: "draft" as "active" | "disabled" | "draft",
        model: "",
        maxOutputTokens: "",
        systemPrompt: "",
        tonePrompts: { formal: "", santai: "", deep: "" },
        updatedAt: null as string | null,
      };
    }

    return {
      name: first.name,
      description: first.description ?? "",
      status: first.status,
      model: first.model ?? "",
      maxOutputTokens: first.max_output_tokens?.toString() ?? "",
      systemPrompt: first.system_prompt ?? "",
      tonePrompts: toTonePrompts(first.metadata),
      updatedAt: first.updated_at,
    };
  }, [first]);

  const [formState, setFormState] = useState(initialState);

  const selected = useMemo(
    () => agents.find((agent) => agent.id === selectedId) ?? null,
    [agents, selectedId],
  );

  const handleSelect = (agentId: string) => {
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) return;
    setSelectedId(agent.id);
    setFormState({
      name: agent.name,
      description: agent.description ?? "",
      status: agent.status,
      model: agent.model ?? "",
      maxOutputTokens: agent.max_output_tokens?.toString() ?? "",
      systemPrompt: agent.system_prompt ?? "",
      tonePrompts: toTonePrompts(agent.metadata),
      updatedAt: agent.updated_at,
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedId) {
      setFeedback("Pilih agent terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      try {
        await updateChatAgentAction({
          id: selectedId,
          name: formState.name,
          description: formState.description,
          status: formState.status,
          model: formState.model,
          maxOutputTokens: formState.maxOutputTokens ? Number(formState.maxOutputTokens) : null,
          systemPrompt: formState.systemPrompt,
          tonePrompts: formState.tonePrompts,
        });
        setFeedback("Agent updated");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update agent");
      }
    });
  };

  return (
    <section className="owner-story-card owner-story-card--wide">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Chat agents</h3>
          <p>Kelola agent percakapan publik yang memandu pengunjung website.</p>
        </div>
      </header>

      <div className={`owner-story-card__body ${agents.length ? "" : "owner-story-card__body--solo"}`}>
        <aside className="owner-story-card__side">
          <ul className="owner-story-card__list">
            {agents.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(agent.id)}
                  className={`owner-story-card__item ${selectedId === agent.id ? "owner-story-card__item--active" : ""}`}
                >
                  <div className="owner-story-card__item-text">
                    <strong>{agent.name}</strong>
                    <small>{agent.slug}</small>
                    <div className="owner-story-card__item-meta">
                      <span>{agent.status}</span>
                      {agent.model ? <span>{agent.model}</span> : null}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {!agents.length && (
              <li className="owner-story-card__empty-block">
                <h4>Belum ada agent</h4>
                <p>Buat agent chat baru melalui panel Create agent di bawah.</p>
              </li>
            )}
          </ul>
        </aside>

        <div className="owner-story-card__form">
          {selected ? (
            <>
              <div className="owner-story-card__legend">
                <span>{selected.slug}</span>
                {formState.updatedAt ? <time>{new Date(formState.updatedAt).toLocaleString()}</time> : null}
              </div>

              <div className="owner-story-card__section">
                <h4>Identitas</h4>
                <div className="owner-story-card__grid owner-story-card__grid--two">
                  <label className="owner-panel__field">
                    <span>Name</span>
                    <input
                      value={formState.name}
                      onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Agent name"
                    />
                  </label>
                  <label className="owner-panel__field">
                    <span>Status</span>
                    <select
                      value={formState.status}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          status: event.target.value as "active" | "disabled" | "draft",
                        }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </label>
                </div>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Description</span>
                  <textarea
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    rows={2}
                    placeholder="Short summary for the agent"
                  />
                </label>
              </div>

              <div className="owner-story-card__section">
                <h4>Model & Output</h4>
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
                    <span>Max output tokens</span>
                    <input
                      type="number"
                      value={formState.maxOutputTokens}
                      onChange={(event) => setFormState((prev) => ({ ...prev, maxOutputTokens: event.target.value }))}
                      placeholder="3200"
                    />
                  </label>
                </div>
              </div>

              <div className="owner-story-card__section">
                <h4>System prompt</h4>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Prompt</span>
                  <textarea
                    value={formState.systemPrompt}
                    onChange={(event) => setFormState((prev) => ({ ...prev, systemPrompt: event.target.value }))}
                    rows={8}
                    placeholder="System prompt for the chat agent"
                  />
                </label>
              </div>

              <div className="owner-story-card__section">
                <h4>Tone directives</h4>
                <p className="owner-story-card__hint">Instruksi tambahan untuk nada formal, santai, atau deep.</p>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Formal</span>
                  <textarea
                    value={formState.tonePrompts.formal}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        tonePrompts: { ...prev.tonePrompts, formal: event.target.value },
                      }))
                    }
                    rows={2}
                  />
                </label>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Santai</span>
                  <textarea
                    value={formState.tonePrompts.santai}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        tonePrompts: { ...prev.tonePrompts, santai: event.target.value },
                      }))
                    }
                    rows={2}
                  />
                </label>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Deep</span>
                  <textarea
                    value={formState.tonePrompts.deep}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        tonePrompts: { ...prev.tonePrompts, deep: event.target.value },
                      }))
                    }
                    rows={2}
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
                    {isPending ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <p className="owner-story-card__empty">Pilih agent untuk diedit.</p>
          )}
        </div>
      </div>
    </section>
  );
};

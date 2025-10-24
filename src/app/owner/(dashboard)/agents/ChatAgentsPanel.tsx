"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { AiAgentRecord } from "@/lib/supabase/agents";
import { updateChatAgentAction } from "./actions";

const buildTonePrompts = (metadata: Record<string, unknown> | null | undefined) => {
  const source = (metadata as Record<string, any>)?.tonePrompts ?? {};
  return {
    formal: typeof source.formal === "string" ? source.formal : "",
    santai: typeof source.santai === "string" ? source.santai : "",
    deep: typeof source.deep === "string" ? source.deep : "",
  };
};

const buildFormState = (agent: AiAgentRecord) => ({
  name: agent.name,
  description: agent.description ?? "",
  status: agent.status ?? "draft",
  model: agent.model ?? "",
  maxOutputTokens: agent.max_output_tokens?.toString() ?? "",
  systemPrompt: agent.system_prompt ?? "",
  tonePrompts: buildTonePrompts(agent.metadata),
  updatedAt: agent.updated_at ?? null,
});

const agentMetrics = (agents: AiAgentRecord[]) => {
  const active = agents.filter((agent) => agent.status === "active").length;
  const disabled = agents.filter((agent) => agent.status === "disabled").length;
  const draft = agents.length - active - disabled;
  return { total: agents.length, active, disabled, draft };
};

type ChatAgentsPanelProps = {
  agents: AiAgentRecord[];
};

export const ChatAgentsPanel = ({ agents }: ChatAgentsPanelProps) => {
  const [forms, setForms] = useState<Record<string, ReturnType<typeof buildFormState>>>(() => {
    const initial: Record<string, ReturnType<typeof buildFormState>> = {};
    for (const agent of agents) {
      initial[agent.id] = buildFormState(agent);
    }
    return initial;
  });
  const [feedbacks, setFeedbacks] = useState<Record<string, string | null>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setForms((prev) => {
      const next = { ...prev };
      let changed = false;
      const ids = new Set<string>();
      for (const agent of agents) {
        ids.add(agent.id);
        if (!next[agent.id]) {
          next[agent.id] = buildFormState(agent);
          changed = true;
        }
      }
      for (const id of Object.keys(next)) {
        if (!ids.has(id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [agents]);

  const metrics = useMemo(() => agentMetrics(agents), [agents]);

  const updateForm = (id: string, updater: (prev: ReturnType<typeof buildFormState>) => ReturnType<typeof buildFormState>) => {
    setForms((prev) => ({
      ...prev,
      [id]: updater(prev[id] ?? buildFormState(agents.find((agent) => agent.id === id)!)),
    }));
  };

  const handleSubmit = (agent: AiAgentRecord) => {
    const state = forms[agent.id] ?? buildFormState(agent);
    setPendingId(agent.id);
    startTransition(async () => {
      try {
        await updateChatAgentAction({
          id: agent.id,
          name: state.name,
          description: state.description,
          status: state.status as "active" | "disabled" | "draft",
          model: state.model,
          maxOutputTokens: state.maxOutputTokens ? Number(state.maxOutputTokens) : null,
          systemPrompt: state.systemPrompt,
          tonePrompts: state.tonePrompts,
        });
        setFeedbacks((prev) => ({ ...prev, [agent.id]: "Agent updated" }));
      } catch (error) {
        setFeedbacks((prev) => ({
          ...prev,
          [agent.id]: error instanceof Error ? error.message : "Failed to update agent",
        }));
      } finally {
        setPendingId(null);
      }
    });
  };

  if (!agents.length) {
    return (
      <section className="owner-story-card owner-story-card--wide">
        <header className="owner-story-card__header">
          <div className="owner-story-card__title">
            <h3>Chat agents</h3>
            <p>Belum ada agent chat yang terdaftar.</p>
          </div>
        </header>
        <p className="owner-story-card__empty">Gunakan panel “Create agent” untuk menambahkan agent baru.</p>
      </section>
    );
  }

  return (
    <section className="owner-story-card owner-story-card--wide">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Chat agents</h3>
          <p>Kelola agent percakapan publik yang memandu pengunjung website.</p>
        </div>
        <div className="owner-story-card__metrics" aria-label="Chat agent overview">
          <article>
            <span>Total</span>
            <strong>{metrics.total}</strong>
          </article>
          <article>
            <span>Active</span>
            <strong>{metrics.active}</strong>
          </article>
          <article>
            <span>Draft</span>
            <strong>{metrics.draft}</strong>
          </article>
          <article>
            <span>Disabled</span>
            <strong>{metrics.disabled}</strong>
          </article>
        </div>
      </header>

      <div className="owner-agent-grid">
        {agents.map((agent) => {
          const state = forms[agent.id] ?? buildFormState(agent);
          const feedback = feedbacks[agent.id] ?? null;
          return (
            <article key={agent.id} className="owner-agent-card">
              <header>
                <div>
                  <strong>{agent.slug}</strong>
                  <span>{state.updatedAt ? new Date(state.updatedAt).toLocaleString() : "Belum pernah disimpan"}</span>
                </div>
              </header>

              <div className="owner-agent-card__status">
                <label>
                  <span>Status</span>
                  <select
                    value={state.status}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({
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

              <div className="owner-agent-card__section">
                <h4>Identitas</h4>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Name</span>
                  <input
                    value={state.name}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </label>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Description</span>
                  <textarea
                    value={state.description}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={2}
                  />
                </label>
              </div>

              <div className="owner-agent-card__section">
                <h4>Model & Output</h4>
                <div className="owner-story-card__grid owner-story-card__grid--two">
                  <label className="owner-panel__field">
                    <span>Model</span>
                    <input
                      value={state.model}
                      onChange={(event) =>
                        updateForm(agent.id, (prev) => ({ ...prev, model: event.target.value }))
                      }
                      placeholder="gpt-5-nano"
                    />
                  </label>
                  <label className="owner-panel__field">
                    <span>Max output tokens</span>
                    <input
                      type="number"
                      value={state.maxOutputTokens}
                      onChange={(event) =>
                        updateForm(agent.id, (prev) => ({ ...prev, maxOutputTokens: event.target.value }))
                      }
                      placeholder="3200"
                    />
                  </label>
                </div>
              </div>

              <div className="owner-agent-card__section">
                <h4>System prompt</h4>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <textarea
                    value={state.systemPrompt}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({ ...prev, systemPrompt: event.target.value }))
                    }
                    rows={7}
                    placeholder="System prompt untuk agent chat"
                  />
                </label>
              </div>

              <div className="owner-agent-card__section">
                <h4>Tone directives</h4>
                <p className="owner-story-card__hint">
                  Instruksi tambahan untuk gaya komunikasi berbeda.
                </p>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Formal</span>
                  <textarea
                    value={state.tonePrompts.formal}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({
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
                    value={state.tonePrompts.santai}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({
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
                    value={state.tonePrompts.deep}
                    onChange={(event) =>
                      updateForm(agent.id, (prev) => ({
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
                    onClick={() => handleSubmit(agent)}
                    disabled={isPending && pendingId === agent.id}
                    className="owner-panel__primary"
                  >
                    {isPending && pendingId === agent.id ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
};

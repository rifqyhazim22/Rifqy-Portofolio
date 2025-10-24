"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { AiAgentRecord } from "@/lib/supabase/agents";
import { updateLibrarianAgentAction } from "./actions";

type LocalePair = { id: string; en: string };

type InstructionsState = {
  intro: LocalePair;
  empathy: LocalePair;
  pronoun: LocalePair;
  tone: {
    default: LocalePair;
    santai: LocalePair;
    deep: LocalePair;
  };
  lengthRule: LocalePair;
  knowledgeInstruction: LocalePair;
  fallback: LocalePair;
  imageGuidance: LocalePair;
  navigationRule: LocalePair;
  contextLead: LocalePair;
};

const DEFAULT_PAIR: LocalePair = { id: "", en: "" };

const DEFAULT_INSTRUCTIONS: InstructionsState = {
  intro: {
    id: "Kamu adalah penjaga perpustakaan digital Rifqy Hazim HR—AI librarian yang mengenal CV, portofolio, dan seluruh narasi website.",
    en: "You are the digital librarian for Rifqy Hazim HR—you know his CV, portfolio, and all narratives on the website.",
  },
  empathy: {
    id: "Jagalah empati, sambut pengunjung layaknya tamu istimewa, dan bantu mereka memahami misi Freedom of Intelligence.",
    en: "Maintain empathy, welcome the visitor like a special guest, and help them understand the Freedom of Intelligence mission.",
  },
  pronoun: {
    id: 'Gunakan "aku" saat merujuk pada dirimu sebagai agent perpustakaan digital ini, sebut Rifqy sebagai pihak ketiga (Rifqy/ beliau), sapa pengunjung dengan "kamu", dan jangan pernah menyebut pengunjung sebagai agent.',
    en: "Use “I/me” for yourself as the site’s library agent, refer to Rifqy in the third person (Rifqy/he), address the visitor as “you”, and never label the visitor as the agent.",
  },
  tone: {
    default: {
      id: "Pertahankan nada profesional yang hangat.",
      en: "Use a confident, warm professional tone.",
    },
    santai: {
      id: "Terapkan nada santai namun tetap profesional dan empatik.",
      en: "Lean into a relaxed yet warm tone.",
    },
    deep: {
      id: "Bangun suasana yang dalam dan reflektif tanpa berlebihan.",
      en: "Use a reflective tone that still feels approachable.",
    },
  },
  lengthRule: {
    id: "Batasi jawaban maksimal 120 kata atau empat kalimat. Mulai dengan jawaban inti, lanjutkan insight ringkas, tawarkan bantuan lanjutan seperlunya, dan gunakan maksimal dua emoji yang benar-benar relevan dengan kalimatnya.",
    en: "Keep the reply under 120 words or four sentences. Lead with the core answer, add concise insight, offer follow-up only if useful, and use at most two emojis that directly support the lines they’re attached to.",
  },
  knowledgeInstruction: {
    id: "Jika menjawab berdasarkan referensi situs, sertakan path halaman di dalam tanda kurung, contoh: (/about).",
    en: "When citing site references, include the page path inside parentheses, e.g., (/about).",
  },
  fallback: {
    id: "Jika kamu belum punya data, jelaskan dengan jujur tanpa mengada-ada dan tawarkan opsi lanjutan seperti menjadwalkan diskusi atau memperbarui dokumen.",
    en: "If information is missing, say so transparently and suggest follow-ups such as scheduling a chat or updating the documents.",
  },
  imageGuidance: {
    id: "Kalau pengunjung mengunggah gambar, sampaikan observasi utama dalam maksimal tiga kalimat. Jika konteks belum jelas, ajukan pertanyaan singkat.",
    en: "If the visitor shares an image, describe the key observations in no more than three sentences. Ask for clarification briefly when needed.",
  },
  navigationRule: {
    id: "Jangan membuat directive navigasi atau format [[NAVIGATE]].",
    en: "Do not produce navigation directives or the [[NAVIGATE]] format.",
  },
  contextLead: {
    id: "Berikut konteks perpustakaan yang bisa kamu gunakan:",
    en: "Here is the library context you can rely on:",
  },
};

const toInstructions = (metadata: Record<string, unknown> | null | undefined): InstructionsState => {
  const raw = ((metadata as Record<string, any>)?.instructions ?? {}) as Record<string, any>;

  const readPair = (key: Exclude<keyof InstructionsState, "tone">): LocalePair => {
    const value = raw[key as string];
    if (value && typeof value === "object") {
      const fallback = (DEFAULT_INSTRUCTIONS as Record<string, any>)[key];
      const fallbackPair: LocalePair = fallback && typeof fallback.id === "string" && typeof fallback.en === "string"
        ? fallback
        : DEFAULT_PAIR;
      return {
        id: typeof value.id === "string" ? value.id : fallbackPair.id,
        en: typeof value.en === "string" ? value.en : fallbackPair.en,
      };
    }
    return DEFAULT_INSTRUCTIONS[key] ?? DEFAULT_PAIR;
  };

  const readTone = (toneKey: "default" | "santai" | "deep"): LocalePair => {
    const tone = raw.tone;
    if (tone && typeof tone === "object" && tone[toneKey]) {
      const value = tone[toneKey];
      const fallback = DEFAULT_INSTRUCTIONS.tone[toneKey];
      return {
        id: typeof value.id === "string" ? value.id : fallback.id,
        en: typeof value.en === "string" ? value.en : fallback.en,
      };
    }
    return DEFAULT_INSTRUCTIONS.tone[toneKey];
  };

  return {
    intro: readPair("intro"),
    empathy: readPair("empathy"),
    pronoun: readPair("pronoun"),
    tone: {
      default: readTone("default"),
      santai: readTone("santai"),
      deep: readTone("deep"),
    },
    lengthRule: readPair("lengthRule"),
    knowledgeInstruction: readPair("knowledgeInstruction"),
    fallback: readPair("fallback"),
    imageGuidance: readPair("imageGuidance"),
    navigationRule: readPair("navigationRule"),
    contextLead: readPair("contextLead"),
  };
};

const buildFormState = (agent: AiAgentRecord) => ({
  name: agent.name,
  description: agent.description ?? "",
  status: agent.status ?? "draft",
  model: agent.model ?? "",
  maxOutputTokens: agent.max_output_tokens?.toString() ?? "",
  instructions: toInstructions(agent.metadata),
  updatedAt: agent.updated_at ?? null,
});

const cloneInstructions = (value: InstructionsState): InstructionsState =>
  JSON.parse(JSON.stringify(value)) as InstructionsState;

type LibrarianAgentsPanelProps = {
  agents: AiAgentRecord[];
};

const STATUS_OPTIONS: Array<{ id: "active" | "draft" | "disabled"; label: string }> = [
  { id: "active", label: "ACTIVE" },
  { id: "draft", label: "DRAFT" },
  { id: "disabled", label: "DISABLED" },
];

const formatUpdatedAt = (value: string | null) => {
  if (!value) return "Belum pernah disimpan";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const localeField = (
  label: string,
  valueId: string,
  valueEn: string,
  onChangeId: (value: string) => void,
  onChangeEn: (value: string) => void,
) => (
  <div className="owner-panel__field owner-panel__field--split">
    <div>
      <span>{label} (ID)</span>
      <textarea value={valueId} onChange={(event) => onChangeId(event.target.value)} rows={2} />
    </div>
    <div>
      <span>{label} (EN)</span>
      <textarea value={valueEn} onChange={(event) => onChangeEn(event.target.value)} rows={2} />
    </div>
  </div>
);

const metrics = (agents: AiAgentRecord[]) => {
  const active = agents.filter((agent) => agent.status === "active").length;
  const disabled = agents.filter((agent) => agent.status === "disabled").length;
  const draft = agents.length - active - disabled;
  return { total: agents.length, active, disabled, draft };
};

export const LibrarianAgentsPanel = ({ agents }: LibrarianAgentsPanelProps) => {
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

  const updateForm = (
    id: string,
    updater: (prev: ReturnType<typeof buildFormState>) => ReturnType<typeof buildFormState>,
  ) => {
    setForms((prev) => ({ ...prev, [id]: updater(prev[id] ?? buildFormState(agents.find((item) => item.id === id)!)) }));
  };

  const updateInstruction = (agentId: string, path: string[], value: string) => {
    updateForm(agentId, (prev) => {
      const instructions = cloneInstructions(prev.instructions);
      let current: any = instructions;
      for (let i = 0; i < path.length - 1; i += 1) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return { ...prev, instructions };
    });
  };

  const handleSubmit = (agent: AiAgentRecord) => {
    const state = forms[agent.id] ?? buildFormState(agent);
    setPendingId(agent.id);
    startTransition(async () => {
      try {
        await updateLibrarianAgentAction({
          id: agent.id,
          name: state.name,
          description: state.description,
          status: state.status as "active" | "disabled" | "draft",
          model: state.model,
          maxOutputTokens: state.maxOutputTokens ? Number(state.maxOutputTokens) : null,
          instructions: state.instructions,
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
            <h3>Librarian agents</h3>
            <p>Belum ada agent librarian yang terdaftar.</p>
          </div>
        </header>
        <p className="owner-story-card__empty">Tambahkan agent baru melalui panel “Create agent”.</p>
      </section>
    );
  }

  const overview = useMemo(() => metrics(agents), [agents]);

  return (
    <section className="owner-story-card owner-story-card--wide">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Librarian agents</h3>
          <p>Atur guardrails dan instruksi untuk agent pustakawan.</p>
        </div>
        <div className="owner-story-card__metrics" aria-label="Librarian agent overview">
          <article>
            <span>Total</span>
            <strong>{overview.total}</strong>
          </article>
          <article>
            <span>Active</span>
            <strong>{overview.active}</strong>
          </article>
          <article>
            <span>Draft</span>
            <strong>{overview.draft}</strong>
          </article>
          <article>
            <span>Disabled</span>
            <strong>{overview.disabled}</strong>
          </article>
        </div>
      </header>

      <div className="owner-agent-grid">
        {agents.map((agent) => {
          const state = forms[agent.id] ?? buildFormState(agent);
          const feedback = feedbacks[agent.id] ?? null;
          return (
            <article key={agent.id} className="owner-agent-card">
              <header className="owner-agent-card__meta">
                <div>
                  <strong>{agent.name}</strong>
                  <span>{agent.slug}</span>
                  <time>{formatUpdatedAt(state.updatedAt)}</time>
                </div>
                <div className="owner-agent-status-toggle" role="group" aria-label={`${agent.slug} status`}>
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`owner-agent-status-toggle__btn ${
                        state.status === option.id ? "is-active" : ""
                      }`}
                      onClick={() =>
                        updateForm(agent.id, (prev) => ({
                          ...prev,
                          status: option.id,
                        }))
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </header>

              <div className="owner-agent-card__section">
                <h4>Identitas</h4>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Name</span>
                  <input
                    value={state.name}
                    onChange={(event) => updateForm(agent.id, (prev) => ({ ...prev, name: event.target.value }))}
                  />
                </label>
                <label className="owner-panel__field owner-story-card__field--wide">
                  <span>Description</span>
                  <textarea
                    value={state.description}
                    onChange={(event) => updateForm(agent.id, (prev) => ({ ...prev, description: event.target.value }))}
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
                      onChange={(event) => updateForm(agent.id, (prev) => ({ ...prev, model: event.target.value }))}
                      placeholder="gpt-5-nano"
                    />
                  </label>
                  <label className="owner-panel__field">
                    <span>Max output tokens</span>
                    <input
                      type="number"
                      value={state.maxOutputTokens}
                      onChange={(event) => updateForm(agent.id, (prev) => ({ ...prev, maxOutputTokens: event.target.value }))}
                      placeholder="3200"
                    />
                  </label>
                </div>
              </div>

              <div className="owner-agent-card__section">
                <h4>Instruksi bahasa</h4>
                {localeField(
                  "Intro",
                  state.instructions.intro.id,
                  state.instructions.intro.en,
                  (value) => updateInstruction(agent.id, ["intro", "id"], value),
                  (value) => updateInstruction(agent.id, ["intro", "en"], value),
                )}
                {localeField(
                  "Empathy",
                  state.instructions.empathy.id,
                  state.instructions.empathy.en,
                  (value) => updateInstruction(agent.id, ["empathy", "id"], value),
                  (value) => updateInstruction(agent.id, ["empathy", "en"], value),
                )}
                {localeField(
                  "Pronoun",
                  state.instructions.pronoun.id,
                  state.instructions.pronoun.en,
                  (value) => updateInstruction(agent.id, ["pronoun", "id"], value),
                  (value) => updateInstruction(agent.id, ["pronoun", "en"], value),
                )}
              </div>

              <div className="owner-agent-card__section">
                <h4>Tone directives</h4>
                {localeField(
                  "Default tone",
                  state.instructions.tone.default.id,
                  state.instructions.tone.default.en,
                  (value) => updateInstruction(agent.id, ["tone", "default", "id"], value),
                  (value) => updateInstruction(agent.id, ["tone", "default", "en"], value),
                )}
                {localeField(
                  "Santai tone",
                  state.instructions.tone.santai.id,
                  state.instructions.tone.santai.en,
                  (value) => updateInstruction(agent.id, ["tone", "santai", "id"], value),
                  (value) => updateInstruction(agent.id, ["tone", "santai", "en"], value),
                )}
                {localeField(
                  "Deep tone",
                  state.instructions.tone.deep.id,
                  state.instructions.tone.deep.en,
                  (value) => updateInstruction(agent.id, ["tone", "deep", "id"], value),
                  (value) => updateInstruction(agent.id, ["tone", "deep", "en"], value),
                )}
              </div>

              <div className="owner-agent-card__section">
                <h4>Rules & fallback</h4>
                {localeField(
                  "Length rule",
                  state.instructions.lengthRule.id,
                  state.instructions.lengthRule.en,
                  (value) => updateInstruction(agent.id, ["lengthRule", "id"], value),
                  (value) => updateInstruction(agent.id, ["lengthRule", "en"], value),
                )}
                {localeField(
                  "Knowledge instruction",
                  state.instructions.knowledgeInstruction.id,
                  state.instructions.knowledgeInstruction.en,
                  (value) => updateInstruction(agent.id, ["knowledgeInstruction", "id"], value),
                  (value) => updateInstruction(agent.id, ["knowledgeInstruction", "en"], value),
                )}
                {localeField(
                  "Fallback",
                  state.instructions.fallback.id,
                  state.instructions.fallback.en,
                  (value) => updateInstruction(agent.id, ["fallback", "id"], value),
                  (value) => updateInstruction(agent.id, ["fallback", "en"], value),
                )}
              </div>

              <div className="owner-agent-card__section">
                <h4>Visual & context</h4>
                {localeField(
                  "Image guidance",
                  state.instructions.imageGuidance.id,
                  state.instructions.imageGuidance.en,
                  (value) => updateInstruction(agent.id, ["imageGuidance", "id"], value),
                  (value) => updateInstruction(agent.id, ["imageGuidance", "en"], value),
                )}
                {localeField(
                  "Navigation rule",
                  state.instructions.navigationRule.id,
                  state.instructions.navigationRule.en,
                  (value) => updateInstruction(agent.id, ["navigationRule", "id"], value),
                  (value) => updateInstruction(agent.id, ["navigationRule", "en"], value),
                )}
                {localeField(
                  "Context lead",
                  state.instructions.contextLead.id,
                  state.instructions.contextLead.en,
                  (value) => updateInstruction(agent.id, ["contextLead", "id"], value),
                  (value) => updateInstruction(agent.id, ["contextLead", "en"], value),
                )}
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

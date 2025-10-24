"use client";

import { useMemo, useState, useTransition } from "react";
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

const DEFAULT_PAIR = { id: "", en: "" };

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

  const readPair = (key: string): LocalePair => {
    const value = raw[key];
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
    const fallback = (DEFAULT_INSTRUCTIONS as Record<string, any>)[key];
    return fallback && typeof fallback.id === "string" && typeof fallback.en === "string"
      ? fallback
      : DEFAULT_PAIR;
  };

  const readTone = (toneKey: "default" | "santai" | "deep" ): LocalePair => {
    const tone = raw.tone;
    if (tone && typeof tone === "object" && tone[toneKey]) {
      return {
        id: typeof tone[toneKey].id === "string" ? tone[toneKey].id : DEFAULT_INSTRUCTIONS.tone[toneKey].id,
        en: typeof tone[toneKey].en === "string" ? tone[toneKey].en : DEFAULT_INSTRUCTIONS.tone[toneKey].en,
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

type LibrarianAgentsPanelProps = {
  agents: AiAgentRecord[];
};

export const LibrarianAgentsPanel = ({ agents }: LibrarianAgentsPanelProps) => {
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
        instructions: DEFAULT_INSTRUCTIONS,
        updatedAt: null as string | null,
      };
    }

    return {
      name: first.name,
      description: first.description ?? "",
      status: first.status,
      model: first.model ?? "",
      maxOutputTokens: first.max_output_tokens?.toString() ?? "",
      instructions: toInstructions(first.metadata),
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
      instructions: toInstructions(agent.metadata),
      updatedAt: agent.updated_at,
    });
    setFeedback(null);
  };

  const updateInstruction = (path: string[], value: string) => {
    setFormState((prev) => {
      const next = structuredClone(prev.instructions);
      let current: any = next;
      for (let i = 0; i < path.length - 1; i += 1) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return { ...prev, instructions: next };
    });
  };

  const handleSubmit = () => {
    if (!selectedId) {
      setFeedback("Pilih agent terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      try {
        await updateLibrarianAgentAction({
          id: selectedId,
          name: formState.name,
          description: formState.description,
          status: formState.status,
          model: formState.model,
          maxOutputTokens: formState.maxOutputTokens ? Number(formState.maxOutputTokens) : null,
          instructions: formState.instructions,
        });
        setFeedback("Agent updated");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update agent");
      }
    });
  };

  const renderLocaleField = (
    label: string,
    pathId: string[],
    pathEn: string[],
    valueId: string,
    valueEn: string,
  ) => (
    <div className="owner-panel__field owner-panel__field--split">
      <div>
        <span>{label} (ID)</span>
        <textarea
          value={valueId}
          onChange={(event) => updateInstruction(pathId, event.target.value)}
          rows={2}
        />
      </div>
      <div>
        <span>{label} (EN)</span>
        <textarea
          value={valueEn}
          onChange={(event) => updateInstruction(pathEn, event.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <section className="owner-story-card owner-story-card--wide">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Librarian agents</h3>
          <p>Atur guardrails dan instruksi untuk agent pustakawan.</p>
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
                <h4>Belum ada librarian agent</h4>
                <p>Gunakan panel Create agent untuk menambah agent baru.</p>
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
                <h4>Instruksi bahasa</h4>
                {renderLocaleField(
                  "Intro",
                  ["intro", "id"],
                  ["intro", "en"],
                  formState.instructions.intro.id,
                  formState.instructions.intro.en,
                )}
                {renderLocaleField(
                  "Empathy",
                  ["empathy", "id"],
                  ["empathy", "en"],
                  formState.instructions.empathy.id,
                  formState.instructions.empathy.en,
                )}
                {renderLocaleField(
                  "Pronoun",
                  ["pronoun", "id"],
                  ["pronoun", "en"],
                  formState.instructions.pronoun.id,
                  formState.instructions.pronoun.en,
                )}
              </div>

              <div className="owner-story-card__section">
                <h4>Tone directives</h4>
                {renderLocaleField(
                  "Default tone",
                  ["tone", "default", "id"],
                  ["tone", "default", "en"],
                  formState.instructions.tone.default.id,
                  formState.instructions.tone.default.en,
                )}
                {renderLocaleField(
                  "Santai tone",
                  ["tone", "santai", "id"],
                  ["tone", "santai", "en"],
                  formState.instructions.tone.santai.id,
                  formState.instructions.tone.santai.en,
                )}
                {renderLocaleField(
                  "Deep tone",
                  ["tone", "deep", "id"],
                  ["tone", "deep", "en"],
                  formState.instructions.tone.deep.id,
                  formState.instructions.tone.deep.en,
                )}
              </div>

              <div className="owner-story-card__section">
                <h4>Rules & fallback</h4>
                {renderLocaleField(
                  "Length rule",
                  ["lengthRule", "id"],
                  ["lengthRule", "en"],
                  formState.instructions.lengthRule.id,
                  formState.instructions.lengthRule.en,
                )}
                {renderLocaleField(
                  "Knowledge instruction",
                  ["knowledgeInstruction", "id"],
                  ["knowledgeInstruction", "en"],
                  formState.instructions.knowledgeInstruction.id,
                  formState.instructions.knowledgeInstruction.en,
                )}
                {renderLocaleField(
                  "Fallback",
                  ["fallback", "id"],
                  ["fallback", "en"],
                  formState.instructions.fallback.id,
                  formState.instructions.fallback.en,
                )}
              </div>

              <div className="owner-story-card__section">
                <h4>Visual & context</h4>
                {renderLocaleField(
                  "Image guidance",
                  ["imageGuidance", "id"],
                  ["imageGuidance", "en"],
                  formState.instructions.imageGuidance.id,
                  formState.instructions.imageGuidance.en,
                )}
                {renderLocaleField(
                  "Navigation rule",
                  ["navigationRule", "id"],
                  ["navigationRule", "en"],
                  formState.instructions.navigationRule.id,
                  formState.instructions.navigationRule.en,
                )}
                {renderLocaleField(
                  "Context lead",
                  ["contextLead", "id"],
                  ["contextLead", "en"],
                  formState.instructions.contextLead.id,
                  formState.instructions.contextLead.en,
                )}
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

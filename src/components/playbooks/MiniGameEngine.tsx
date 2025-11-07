"use client";

import { useMemo, useState } from "react";
import type { TrainingGameLevel } from "./types";

interface MiniGameEngineProps {
  level: TrainingGameLevel;
  disabled?: boolean;
  onSuccess: (result?: { bonusXp?: number }) => void;
  onFail?: () => void;
}

interface StatusMessage {
  tone: "success" | "error" | "info";
  text: string;
}

export function MiniGameEngine({ level, disabled, onSuccess, onFail }: MiniGameEngineProps) {
  const challenge = level.challenge;
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pickedOrder, setPickedOrder] = useState<string[]>([]);
  const [sandboxNote, setSandboxNote] = useState("");
  const [sandboxChecklist, setSandboxChecklist] = useState<Record<string, boolean>>(() => {
    if (challenge.type !== "sandbox") return {};
    return Object.fromEntries(challenge.checklist.map((item) => [item, false]));
  });
  const [completed, setCompleted] = useState(false);

  const availableDragItems = useMemo(() => {
    if (challenge.type !== "drag-drop") return [];
    return challenge.items.filter((item) => !pickedOrder.includes(item.id));
  }, [challenge, pickedOrder]);

  const concludeSuccess = (message: string, bonusXp = 0) => {
    setStatus({ tone: "success", text: message });
    setCompleted(true);
    onSuccess({ bonusXp });
  };

  const concludeFail = (message: string) => {
    setStatus({ tone: "error", text: message });
    onFail?.();
  };

  const handleDecisionTree = (optionId: string) => {
    if (completed || disabled || challenge.type !== "decision-tree") return;
    const option = challenge.options.find((item) => item.id === optionId);
    if (!option) return;
    setSelectedOption(optionId);
    if (option.outcome === "success") {
      concludeSuccess(option.feedback, option.xpBonus ?? 0);
    } else {
      concludeFail(option.feedback);
    }
  };

  const handleQuiz = (optionId: string) => {
    if (completed || disabled || challenge.type !== "quiz") return;
    setSelectedOption(optionId);
    const isCorrect = optionId === challenge.correctOptionId;
    const option = challenge.options.find((item) => item.id === optionId);
    if (!option) return;
    if (isCorrect) {
      concludeSuccess(option.explanation);
    } else {
      concludeFail(option.explanation);
    }
  };

  const handlePickOrder = (itemId: string) => {
    if (completed || disabled || challenge.type !== "drag-drop") return;
    setPickedOrder((current) => [...current, itemId]);
  };

  const handleResetOrder = () => {
    setPickedOrder([]);
    setStatus(null);
  };

  const hasFinishedOrder =
    challenge.type === "drag-drop" && pickedOrder.length === challenge.items.length;

  if (hasFinishedOrder && !completed && challenge.type === "drag-drop") {
    const isCorrect = pickedOrder.every((id, index) => id === challenge.correctOrder[index]);
    if (isCorrect) {
      concludeSuccess("Urutanmu rapi, agent langsung paham!");
    } else {
      concludeFail("Urutan belum tepat. Coba reset dan susun lagi.");
    }
  }

  const toggleSandboxChecklist = (item: string) => {
    setSandboxChecklist((current) => ({ ...current, [item]: !current[item] }));
  };

  const sandboxReady =
    challenge.type === "sandbox" &&
    Object.values(sandboxChecklist).every((value) => value) &&
    sandboxNote.trim().length >= 80;

  const handleSandboxSubmit = () => {
    if (completed || disabled || challenge.type !== "sandbox") return;
    if (!sandboxReady) {
      concludeFail("Lengkapi checklist dan tulis ringkasan minimal 80 karakter.");
      return;
    }
    concludeSuccess("Outline siap dikirim ke partner. AI bisa bantu sempurnakan.");
  };

  const renderDecisionTree = () => {
    if (challenge.type !== "decision-tree") return null;
    return (
      <div className="minigame">
        <p className="sub">{challenge.scenario}</p>
        <strong>{challenge.question}</strong>
        <div className="minigame__options">
          {challenge.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={completed || disabled}
              className={`pill minigame__option${selectedOption === option.id ? " minigame__option--picked" : ""}`}
              onClick={() => handleDecisionTree(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (challenge.type !== "quiz") return null;
    return (
      <div className="minigame">
        <strong>{challenge.question}</strong>
        <div className="minigame__options">
          {challenge.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={completed || disabled}
              className={`pill minigame__option${selectedOption === option.id ? " minigame__option--picked" : ""}`}
              onClick={() => handleQuiz(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDragDrop = () => {
    if (challenge.type !== "drag-drop") return null;
    return (
      <div className="minigame">
        <p className="sub">{challenge.prompt}</p>
        <div className="minigame__order">
          <div>
            <span className="minigame__label">Langkah tersedia</span>
            <div className="minigame__cards">
              {availableDragItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={completed || disabled}
                  className="minigame__card"
                  onClick={() => handlePickOrder(item.id)}
                >
                  <strong>{item.label}</strong>
                  {item.description ? <p className="sub">{item.description}</p> : null}
                </button>
              ))}
              {!availableDragItems.length && !pickedOrder.length ? (
                <p className="sub">Semua langkah telah dipilih.</p>
              ) : null}
            </div>
          </div>
          <div>
            <span className="minigame__label">Urutanmu</span>
            <ol className="minigame__picked">
              {pickedOrder.map((itemId, index) => {
                const item = challenge.items.find((entry) => entry.id === itemId);
                return <li key={itemId}>{item?.label ?? itemId}</li>;
              })}
            </ol>
            <button type="button" className="pill" onClick={handleResetOrder} disabled={!pickedOrder.length}>
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSandbox = () => {
    if (challenge.type !== "sandbox") return null;
    return (
      <div className="minigame">
        <p className="sub">{challenge.instructions}</p>
        <div className="minigame__checklist">
          {challenge.checklist.map((item) => (
            <label key={item} className="minigame__checkbox">
              <input
                type="checkbox"
                checked={Boolean(sandboxChecklist[item])}
                onChange={() => toggleSandboxChecklist(item)}
                disabled={completed || disabled}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <textarea
          className="minigame__textarea"
          rows={5}
          value={sandboxNote}
          onChange={(event) => setSandboxNote(event.target.value)}
          placeholder="Catat outline atau instruksi yang ingin kamu kirim."
          disabled={completed || disabled}
        />
        <div className="minigame__sandbox-actions">
          <button type="button" className="pill" onClick={handleSandboxSubmit} disabled={completed || disabled}>
            Kirim Outline
          </button>
          <a
            className="pill"
            href={`/ai-agent?playbookId=${level.id}&action=sandbox&prompt=${encodeURIComponent(challenge.aiPrompt)}`}
            target="_blank"
          >
            Minta Bantuan AI
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="minigame__container">
      {renderDecisionTree()}
      {renderQuiz()}
      {renderDragDrop()}
      {renderSandbox()}
      {status ? <p className={`minigame__status minigame__status--${status.tone}`}>{status.text}</p> : null}
    </div>
  );
}

export default MiniGameEngine;

"use client";

import { useEffect, useState } from "react";

type ToneOption = {
  id: "formal" | "santai" | "deep";
  label: string;
  hint: string;
};

const STORAGE_KEY = "rh-tone";

const OPTIONS: ToneOption[] = [
  { id: "formal", label: "Formal", hint: "✨" },
  { id: "santai", label: "Santai", hint: "💫" },
  { id: "deep", label: "Deep", hint: "🌌" },
];

function resolveInitialTone(): ToneOption["id"] {
  if (typeof window === "undefined") {
    return "formal";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as ToneOption["id"] | null;
  if (stored && OPTIONS.some((option) => option.id === stored)) {
    return stored;
  }
  return "formal";
}

export default function ToneToggle() {
  const [tone, setTone] = useState<ToneOption["id"]>("formal");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = resolveInitialTone();
    setTone(initial);
    document.documentElement.dataset.tone = initial;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.tone = tone;
    window.localStorage.setItem(STORAGE_KEY, tone);
    window.dispatchEvent(new CustomEvent("tonechange", { detail: { tone } }));
  }, [tone, ready]);

  const handleSelect = (value: ToneOption["id"]) => {
    setTone(value);
  };

  return (
    <div className="tone-toggle" role="group" aria-label="Mode bahasa penyampaian">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className="pill tone-toggle__option"
          data-active={tone === option.id ? "true" : undefined}
          aria-pressed={tone === option.id}
          onClick={() => handleSelect(option.id)}
        >
          <span className="tone-toggle__hint" aria-hidden="true">
            {option.hint}
          </span>
          {ready ? option.label : "…"}
        </button>
      ))}
    </div>
  );
}

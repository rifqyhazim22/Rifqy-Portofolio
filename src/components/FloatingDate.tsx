"use client";

import { useEffect, useState } from "react";

type Language = "id" | "en";

function resolveLanguage(): Language {
  if (typeof document === "undefined") return "id";
  return document.documentElement.lang === "en" ? "en" : "id";
}

function formatDate(date: Date, language: Language) {
  const locale = language === "en" ? "en-US" : "id-ID";
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function FloatingDate() {
  const [language, setLanguage] = useState<Language>("id");
  const [now, setNow] = useState(() => new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLanguage(resolveLanguage());
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const formatted = formatDate(now, language);
  const shortLabel =
    language === "id"
      ? now.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
      : now.toLocaleDateString("en-US", { day: "2-digit", month: "short" });

  return (
    <div
      className="floating-date"
      data-expanded={expanded ? "true" : undefined}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        type="button"
        className="floating-date__button pill"
        onClick={() => setExpanded((value) => !value)}
        aria-label={formatted}
      >
        📅 {shortLabel}
      </button>
      <div className="floating-date__panel card">
        <p>{formatted}</p>
        <p className="floating-date__time">
          {now.toLocaleTimeString(language === "en" ? "en-US" : "id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

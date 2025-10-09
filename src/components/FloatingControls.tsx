"use client";

import { useEffect, useRef, useState } from "react";
import LanguageToggle from "./LanguageToggle";
import PaletteToggle from "./PaletteToggle";
import TextScaleToggle from "./TextScaleToggle";
import ThemeToggle from "./ThemeToggle";
import ToneToggle from "./ToneToggle";
import type { Language } from "@/lib/language";

type FloatingControlsProps = {
  language: Language;
  languageToggle: {
    label: string;
    options: { id: string; en: string };
  };
};

export default function FloatingControls({ language, languageToggle }: FloatingControlsProps) {
  const [open, setOpen] = useState(false);
  const [forceClickable, setForceClickable] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((value) => !value);
  };

  useEffect(() => {
    setForceClickable(typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches);
  }, []);

  const handleFocusCapture = () => {
    setOpen(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;
    if (!menuRef.current.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div
      className="floating-menu"
      ref={menuRef}
      onFocusCapture={handleFocusCapture}
      onBlur={handleBlur}
      onPointerEnter={forceClickable ? undefined : () => setOpen(true)}
      onPointerLeave={forceClickable ? undefined : () => setOpen(false)}
    >
      <button
        type="button"
        className="pill floating-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="floating-menu-panel"
        onClick={handleToggle}
      >
        FITUR
      </button>
      <div
        id="floating-menu-panel"
        className="floating-menu__panel card"
        data-open={open ? "true" : undefined}
        role="region"
        aria-label="Fitur tampilan"
      >
        <ThemeToggle />
        <PaletteToggle />
        <TextScaleToggle />
        <ToneToggle />
        <LanguageToggle language={language} label={languageToggle.label} options={languageToggle.options} />
      </div>
    </div>
  );
}

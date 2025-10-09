"use client";

import { useRef, useState } from "react";
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
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleOpen = () => {
    clearHoverTimer();
    setOpen(true);
  };

  const handleClose = () => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      setOpen(false);
    }, 140);
  };

  const handlePointerLeave = () => {
    handleClose();
  };

  return (
    <div
      className="floating-menu"
      ref={menuRef}
      onPointerEnter={handleOpen}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleOpen}
      onBlur={handleClose}
    >
      <button
        type="button"
        className="pill floating-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="floating-menu-panel"
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

"use client";

import { headerNav, type NavLabelKey } from "@/data/navLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { Language } from "@/lib/language";
import BaseLink from "./BaseLink";
import AnalogClock from "./AnalogClock";
import LanguageToggle from "./LanguageToggle";
import PaletteToggle from "./PaletteToggle";
import TextScaleToggle from "./TextScaleToggle";
import ThemeToggle from "./ThemeToggle";
import ToneToggle from "./ToneToggle";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface HeaderProps {
  brand: string;
  navLabels: Record<NavLabelKey, string>;
  language: Language;
  languageToggle: {
    label: string;
    options: { id: string; en: string };
  };
}

const MOBILE_QUERY = "(max-width: 720px)";

export default function Header({ brand, navLabels, language, languageToggle }: HeaderProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [controlsWidth, setControlsWidth] = useState(0);
  const menuHoverTimer = useRef<number | undefined>(undefined);
  const featuresHoverTimer = useRef<number | undefined>(undefined);

  const aboutActive = isActive(pathname, "/about");

  // Track control cluster width to size the overlay
  useEffect(() => {
    const updateWidth = () => {
      if (!controlsRef.current) return;
      setControlsWidth(controlsRef.current.offsetWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Lock body scroll for mobile overlays
  useEffect(() => {
    const body = document.body;
    const media = window.matchMedia(MOBILE_QUERY);

    const update = () => {
      if ((menuOpen || featuresOpen) && media.matches) {
        body.classList.add("scroll-locked");
      } else {
        body.classList.remove("scroll-locked");
      }
    };

    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
    } else if (typeof media.addListener === "function") {
      media.addListener(update);
    }

    return () => {
      body.classList.remove("scroll-locked");
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", update);
      } else if (typeof media.removeListener === "function") {
        media.removeListener(update);
      }
    };
  }, [menuOpen, featuresOpen]);

  // Clear hover timers on unmount
  useEffect(() => () => {
    if (menuHoverTimer.current) {
      window.clearTimeout(menuHoverTimer.current);
    }
    if (featuresHoverTimer.current) {
      window.clearTimeout(featuresHoverTimer.current);
    }
  }, []);

  const clearMenuHoverTimer = () => {
    if (menuHoverTimer.current) {
      window.clearTimeout(menuHoverTimer.current);
      menuHoverTimer.current = undefined;
    }
  };

  const clearFeaturesHoverTimer = () => {
    if (featuresHoverTimer.current) {
      window.clearTimeout(featuresHoverTimer.current);
      featuresHoverTimer.current = undefined;
    }
  };

  const closeFeatures = () => {
    clearFeaturesHoverTimer();
    setFeaturesOpen(false);
  };

  const openMenu = () => {
    clearMenuHoverTimer();
    closeFeatures();
    setMenuOpen(true);
  };

  const closeMenu = () => {
    clearMenuHoverTimer();
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const scheduleCloseMenu = () => {
    clearMenuHoverTimer();
    menuHoverTimer.current = window.setTimeout(() => {
      closeMenu();
    }, 160);
  };

  const handleNavigate = () => {
    closeMenu();
    closeFeatures();
  };

  const openFeatures = () => {
    clearFeaturesHoverTimer();
    closeMenu();
    setFeaturesOpen(true);
  };

  const toggleFeatures = () => {
    if (featuresOpen) {
      closeFeatures();
    } else {
      openFeatures();
    }
  };

  const scheduleCloseFeatures = () => {
    clearFeaturesHoverTimer();
    featuresHoverTimer.current = window.setTimeout(() => {
      closeFeatures();
    }, 160);
  };

  useEffect(() => {
    if (!menuOpen && !featuresOpen) return;

    const closeAll = () => {
      if (menuHoverTimer.current) {
        window.clearTimeout(menuHoverTimer.current);
        menuHoverTimer.current = undefined;
      }
      if (featuresHoverTimer.current) {
        window.clearTimeout(featuresHoverTimer.current);
        featuresHoverTimer.current = undefined;
      }
      setMenuOpen(false);
      setFeaturesOpen(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!controlsRef.current?.contains(target)) {
        closeAll();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAll();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, featuresOpen]);

  const shouldHandleHover = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      return false;
    }
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
    }
    return false;
  };

  const handleMenuPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldHandleHover(event)) return;
    openMenu();
  };

  const handleMenuPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldHandleHover(event)) return;
    scheduleCloseMenu();
  };

  const handleMenuBlur = (event: FocusEvent<HTMLElement>) => {
    const related = event.relatedTarget as Node | null;
    if (related && controlsRef.current?.contains(related)) {
      return;
    }

    window.setTimeout(() => {
      const active = document.activeElement;
      if (!active || !controlsRef.current?.contains(active)) {
        closeMenu();
      }
    }, 0);
  };

  const handleFeaturesPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldHandleHover(event)) return;
    openFeatures();
  };

  const handleFeaturesPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldHandleHover(event)) return;
    scheduleCloseFeatures();
  };

  const handleFeaturesBlur = (event: FocusEvent<HTMLElement>) => {
    const related = event.relatedTarget as Node | null;
    if (related && controlsRef.current?.contains(related)) {
      return;
    }

    window.setTimeout(() => {
      const active = document.activeElement;
      if (!active || !controlsRef.current?.contains(active)) {
        closeFeatures();
      }
    }, 0);
  };

  return (
    <header className="sitebar">
      <div className="bar wrap">
        <div className="brand-group">
          <AnalogClock />
          <Link href="/" className="brand pill">
            {brand}
          </Link>
          <BaseLink
            href="/about"
            className="pill pill--compact brand-about"
            data-active={aboutActive ? "true" : undefined}
            aria-current={aboutActive ? "page" : undefined}
          >
            {navLabels.about}
          </BaseLink>
        </div>
        <div className="cluster" ref={controlsRef}>
          <div className="cluster-controls">
            <button
              type="button"
              className="pill menu-button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={toggleMenu}
              onPointerEnter={handleMenuPointerEnter}
              onPointerLeave={handleMenuPointerLeave}
              onFocus={openMenu}
              onBlur={handleMenuBlur}
            >
              MENU
            </button>
            <button
              type="button"
              className="pill menu-button"
              aria-haspopup="true"
              aria-expanded={featuresOpen}
              aria-controls="feature-menu"
              onClick={toggleFeatures}
              onPointerEnter={handleFeaturesPointerEnter}
              onPointerLeave={handleFeaturesPointerLeave}
              onFocus={openFeatures}
              onBlur={handleFeaturesBlur}
            >
              FITUR
            </button>
          </div>
          {featuresOpen && (
            <div
              id="feature-menu"
              className="menu-overlay card features-overlay"
              style={controlsWidth ? { width: controlsWidth } : undefined}
              role="region"
              aria-label="Pengaturan tampilan"
              onPointerEnter={handleFeaturesPointerEnter}
              onPointerLeave={handleFeaturesPointerLeave}
              onFocusCapture={openFeatures}
              onBlur={handleFeaturesBlur}
            >
              <div className="features-overlay__list">
                <ThemeToggle />
                <PaletteToggle />
                <TextScaleToggle />
                <ToneToggle />
                <LanguageToggle
                  language={language}
                  label={languageToggle.label}
                  options={languageToggle.options}
                />
              </div>
            </div>
          )}
          {menuOpen && (
            <div
              id="site-menu"
              ref={overlayRef}
              className="menu-overlay card"
              style={controlsWidth ? { width: controlsWidth } : undefined}
              onPointerEnter={handleMenuPointerEnter}
              onPointerLeave={handleMenuPointerLeave}
              onFocusCapture={openMenu}
              onBlur={handleMenuBlur}
            >
              <nav aria-label="Primary navigation">
                <ul className="menu-list">
                  {headerNav.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.key} className="menu-item">
                        <BaseLink
                          href={item.href}
                          className="menu-link"
                          data-active={active}
                          aria-current={active ? "page" : undefined}
                          onClick={handleNavigate}
                        >
                          {navLabels[item.key]}
                        </BaseLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

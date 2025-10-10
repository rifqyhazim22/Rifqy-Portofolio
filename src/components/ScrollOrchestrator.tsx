"use client";

import { useEffect } from "react";

const SELECTOR = "[data-animate]";

export default function ScrollOrchestrator() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const targets = document.querySelectorAll<HTMLElement>(SELECTOR);
      targets.forEach((target) => target.setAttribute("data-animate-ready", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-animate-ready", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    const targets = document.querySelectorAll<HTMLElement>(SELECTOR);
    targets.forEach((target) => observer.observe(target));

    const fallback = window.setTimeout(() => {
      targets.forEach((target) => {
        if (!target.hasAttribute("data-animate-ready")) {
          target.setAttribute("data-animate-ready", "true");
        }
      });
    }, 320);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return null;
}

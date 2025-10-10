"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = "[data-animate]";

export default function ScrollOrchestrator() {
  const pathname = usePathname();

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
        if (target.hasAttribute("data-animate-ready")) return;
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          target.setAttribute("data-animate-ready", "true");
          observer.unobserve(target);
        }
      });
    }, 280);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

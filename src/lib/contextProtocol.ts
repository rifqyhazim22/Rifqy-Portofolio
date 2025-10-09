import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface ContextLink {
  label: string;
  href: string;
}

export interface ContextSection {
  id: string;
  title: string;
  summary: string;
  links?: ContextLink[];
}

export interface SiteContext {
  version: string;
  updatedAt: string;
  sections: ContextSection[];
}

const contextPath = join(process.cwd(), "content", "context", "site.json");

export function getSiteContext(): SiteContext {
  const raw = readFileSync(contextPath, "utf8");
  return JSON.parse(raw) as SiteContext;
}

export function updateSiteContext(partial: Partial<SiteContext>): SiteContext {
  const current = getSiteContext();
  const next: SiteContext = {
    ...current,
    ...partial,
    sections: partial.sections ?? current.sections,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(contextPath, JSON.stringify(next, null, 2));
  return next;
}

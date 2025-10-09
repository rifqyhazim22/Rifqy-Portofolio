import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Language } from "@/lib/language";
import type { IndustryContent } from "./types";

const cache = new Map<Language, IndustryContent>();

export function loadIndustryContent(language: Language): IndustryContent {
  if (cache.has(language)) {
    return cache.get(language)!;
  }

  const filepath = join(process.cwd(), "content", "industry", `${language}.json`);
  const raw = readFileSync(filepath, "utf8");
  const parsed = JSON.parse(raw) as IndustryContent;
  cache.set(language, parsed);
  return parsed;
}

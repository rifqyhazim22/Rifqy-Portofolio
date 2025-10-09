import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Language } from "@/lib/language";
import type { UpdatesContent } from "./types";

const cache = new Map<Language, UpdatesContent>();

export function loadUpdatesContent(language: Language): UpdatesContent {
  if (cache.has(language)) {
    return cache.get(language)!;
  }

  const filepath = join(process.cwd(), "content", "updates", `${language}.json`);
  const raw = readFileSync(filepath, "utf8");
  const parsed = JSON.parse(raw) as UpdatesContent;
  cache.set(language, parsed);
  return parsed;
}

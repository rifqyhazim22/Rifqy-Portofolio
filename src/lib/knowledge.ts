import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Language } from "./language";

export interface KnowledgeSource {
  type: "page" | "documents" | "note";
  paths: string[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  summary: string;
  details: string[];
  source: KnowledgeSource;
  keywords: string[];
}

let cache: KnowledgeEntry[] | null = null;

function loadManifest(): KnowledgeEntry[] {
  if (cache) {
    return cache;
  }

  const manifestPath = join(process.cwd(), "web-updates-containers", "manifest.json");
  const raw = readFileSync(manifestPath, "utf8");
  const parsed = JSON.parse(raw) as KnowledgeEntry[];

  cache = parsed;
  return parsed;
}

export function getKnowledgeEntries(): KnowledgeEntry[] {
  return loadManifest();
}

export function findKnowledgeSnippets(query: string | undefined, limit = 4): KnowledgeEntry[] {
  const entries = loadManifest();
  if (!query) {
    return entries.slice(0, limit);
  }

  const normalized = query.toLowerCase();
  const scored = entries.map((entry) => {
    const keywords = entry.keywords.map((keyword) => keyword.toLowerCase());
    const keywordScore = keywords.reduce((score, keyword) => {
      if (normalized.includes(keyword)) {
        return score + 3;
      }
      if (keyword.includes(normalized) || normalized.includes(keyword)) {
        return score + 2;
      }
      return score;
    }, 0);

    const textBlock = `${entry.summary} ${entry.details.join(" ")}`.toLowerCase();
    const textScore = textBlock.includes(normalized) ? 2 : 0;
    const total = keywordScore + textScore;

    return { entry, score: total };
  });

  scored.sort((a, b) => b.score - a.score);

  const filtered = scored.filter((item) => item.score > 0).map((item) => item.entry);

  const results = filtered.length ? filtered.slice(0, limit) : entries.slice(0, limit);
  const unique: KnowledgeEntry[] = [];
  const seen = new Set<string>();

  for (const entry of results) {
    if (!seen.has(entry.id)) {
      unique.push(entry);
      seen.add(entry.id);
    }
  }

  return unique;
}

export function knowledgeToContext(entries: KnowledgeEntry[], language: Language = "id"): string {
  if (!entries.length) {
    return language === "en" ? "No additional context." : "Tidak ada konteks tambahan.";
  }

  const summaryLabel = language === "en" ? "Summary" : "Ringkasan";
  const pageReference = language === "en" ? "Page references" : "Referensi halaman";
  const documentReference = language === "en" ? "Document references" : "Referensi dokumen";
  const noteReference = language === "en" ? "Internal note" : "Catatan internal";

  return entries
    .map((entry) => {
      const source =
        entry.source.type === "page"
          ? `${pageReference}: ${entry.source.paths.join(", ")}`
          : entry.source.type === "documents"
            ? `${documentReference}: ${entry.source.paths.join(", ")}`
            : `${noteReference} (${entry.source.paths.join(", ")})`;
      const bullets = entry.details.map((detail) => `- ${detail}`).join("\n");
      return `### ${entry.title}\n${summaryLabel}: ${entry.summary}\n${bullets ? `${bullets}\n` : ""}${source}`;
    })
    .join("\n\n");
}

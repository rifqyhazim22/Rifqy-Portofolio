import type { Language } from "./language";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const maybeParseJsonObject = (value: string): UnknownRecord | null => {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const mergeRecords = (base: unknown, overlay: unknown): UnknownRecord => {
  const baseRecord = isRecord(base) ? base : {};
  const overlayRecord = isRecord(overlay) ? overlay : {};
  return { ...baseRecord, ...overlayRecord };
};

export const resolveLocalizedMetadata = <T>(
  metadata: unknown,
  language: Language,
): Partial<T> | null => {
  if (!metadata) {
    return null;
  }

  if (!isRecord(metadata)) {
    return language === "id" ? (metadata as Partial<T>) : null;
  }

  const translations = metadata.translations;
  if (isRecord(translations)) {
    const localized = translations[language];
    if (localized) {
      return mergeRecords(translations.id ?? translations.default, localized) as Partial<T>;
    }
    if (language === "id") {
      const fallback = translations.id ?? translations.default;
      return isRecord(fallback) ? (fallback as Partial<T>) : null;
    }
    return null;
  }

  const direct = metadata[language];
  if (direct) {
    return mergeRecords(metadata.id ?? metadata.default, direct) as Partial<T>;
  }

  if (language === "id") {
    return metadata as Partial<T>;
  }

  return null;
};

export const resolveLocalizedText = (
  raw: string | null | undefined,
  language: Language,
  fallback: string,
): string => {
  if (!raw) {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("{")) {
    const parsed = maybeParseJsonObject(trimmed);
    if (parsed) {
      const localized = parsed[language];
      if (typeof localized === "string" && localized.trim()) {
        return localized.trim();
      }
      if (language === "id") {
        const baseValue = parsed.id ?? parsed.default ?? parsed["id-ID"];
        if (typeof baseValue === "string" && baseValue.trim()) {
          return baseValue.trim();
        }
      }
      return fallback;
    }
  }

  return language === "id" ? trimmed : fallback;
};

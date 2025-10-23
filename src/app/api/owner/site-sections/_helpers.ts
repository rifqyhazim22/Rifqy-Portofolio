import type {
  CreateSiteSectionInput,
  SiteSectionUpdateInput,
} from "@/lib/supabase/owner-content";

const parseMetadata = (
  value: unknown,
): { metadata?: Record<string, unknown> | null; error?: string } => {
  if (value === undefined) return {};
  if (value === null) return { metadata: null };
  if (typeof value === "object") {
    return { metadata: value as Record<string, unknown> };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return { metadata: null };
    }
    try {
      return { metadata: JSON.parse(trimmed) };
    } catch {
      return { error: "Metadata must be valid JSON" };
    }
  }
  return { error: "Metadata format is not supported" };
};

const parseStatus = (value: unknown) => {
  if (value === "draft" || value === "published") {
    return value;
  }
  return undefined;
};

export const buildCreateSectionInput = (
  body: Record<string, unknown>,
): { input: CreateSiteSectionInput | null; error?: string } => {
  const slug = typeof body.slug === "string" ? body.slug : null;
  if (!slug || !slug.trim()) {
    return { input: null, error: "Slug is required" };
  }

  const metaResult = parseMetadata(body.metadata);
  if (metaResult.error) {
    return { input: null, error: metaResult.error };
  }

  const input: CreateSiteSectionInput = {
    slug,
    title: typeof body.title === "string" ? body.title : undefined,
    body: typeof body.body === "string" ? body.body : undefined,
    metadata: metaResult.metadata,
    status: parseStatus(body.status),
  };

  return { input };
};

export const buildUpdateSectionInput = (
  body: Record<string, unknown>,
): { input: Omit<SiteSectionUpdateInput, "id"> | null; error?: string } => {
  const metaResult = parseMetadata(body.metadata);
  if (metaResult.error) {
    return { input: null, error: metaResult.error };
  }

  const input: Omit<SiteSectionUpdateInput, "id"> = {
    title: typeof body.title === "string" ? body.title : undefined,
    body: typeof body.body === "string" ? body.body : undefined,
    metadata: metaResult.metadata,
    status: parseStatus(body.status),
  };

  return { input };
};

import type { UpsertProjectInput } from "@/lib/supabase/owner-content";

const normalizeTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : null))
      .filter((entry): entry is string => Boolean(entry));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return undefined;
};

export const buildProjectInput = (
  body: Record<string, unknown>,
  options: { requireTitle?: boolean } = { requireTitle: true },
): UpsertProjectInput | null => {
  const rawTitle = typeof body.title === "string" ? body.title : null;
  if (options.requireTitle !== false && (!rawTitle || !rawTitle.trim())) {
    return null;
  }

  const title = rawTitle ?? "";
  const tags = normalizeTags(body.tags);

  const input: UpsertProjectInput = {
    title,
    tagline: typeof body.tagline === "string" ? body.tagline : undefined,
    description:
      typeof body.description === "string" ? body.description : undefined,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    linkUrl: typeof body.linkUrl === "string" ? body.linkUrl : undefined,
    heroImageUrl:
      typeof body.heroImageUrl === "string" ? body.heroImageUrl : undefined,
    tags,
    isFeatured:
      typeof body.isFeatured === "boolean"
        ? body.isFeatured
        : undefined,
    status:
      body.status === "draft" || body.status === "published"
        ? body.status
        : undefined,
  };

  if (body.displayOrder === null) {
    input.displayOrder = null;
  } else if (typeof body.displayOrder === "number") {
    input.displayOrder = Number.isFinite(body.displayOrder)
      ? body.displayOrder
      : undefined;
  } else if (
    typeof body.displayOrder === "string" &&
    body.displayOrder.trim()
  ) {
    const parsed = Number(body.displayOrder);
    if (!Number.isNaN(parsed)) {
      input.displayOrder = parsed;
    }
  }

  return input;
};

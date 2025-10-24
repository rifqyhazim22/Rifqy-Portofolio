import { createSupabaseServiceClient } from "./service-client";
import { resetSupabaseContentCache } from "./content";

type StatusValue = "draft" | "published";

const cleanUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;

const normalizeString = (value?: string | null) => {
  if (value === undefined) return undefined;
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
};

const normalizeSlug = (value?: string | null) => {
  if (value === undefined) return undefined;
  const trimmed = value?.trim().toLowerCase() ?? "";
  return trimmed.length ? trimmed : null;
};

const normalizeStringArray = (value?: string[] | null) => {
  if (value === undefined) return undefined;
  if (!value) return null;
  const filtered = value
    .map((entry) => entry.trim())
    .filter((entry) => entry.length);
  return filtered.length ? filtered : null;
};

export type SiteSectionUpdateInput = {
  id: string;
  title?: string | null;
  body?: string | null;
  metadata?: Record<string, unknown> | null;
  status?: StatusValue;
};

export type CreateSiteSectionInput = {
  slug: string;
  title?: string | null;
  body?: string | null;
  metadata?: Record<string, unknown> | null;
  status?: StatusValue;
};

export const createSiteSectionRecord = async (
  input: CreateSiteSectionInput,
) => {
  const supabase = createSupabaseServiceClient();
  const payload = cleanUndefined({
    slug: input.slug.trim().toLowerCase(),
    title: normalizeString(input.title ?? undefined),
    body: input.body ?? undefined,
    metadata: input.metadata ?? undefined,
    status: input.status ?? "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (!payload.slug) {
    throw new Error("Section slug is required");
  }

  const { data, error } = await supabase
    .from("site_sections")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  return data;
};

export const updateSiteSectionRecord = async (
  input: SiteSectionUpdateInput,
) => {
  const supabase = createSupabaseServiceClient();
  const payload = cleanUndefined({
    title: normalizeString(input.title ?? undefined),
    body: input.body ?? undefined,
    metadata: input.metadata ?? undefined,
    status: input.status ?? undefined,
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from("site_sections")
    .update(payload)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  return data;
};

export type UpsertProjectInput = {
  id?: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  slug?: string | null;
  linkUrl?: string | null;
  heroImageUrl?: string | null;
  tags?: string[] | null;
  displayOrder?: number | null;
  isFeatured?: boolean;
  status?: StatusValue;
};

export const upsertProjectRecord = async (input: UpsertProjectInput) => {
  const supabase = createSupabaseServiceClient();

  const statusValue =
    input.status ?? (input.id ? undefined : "draft");

  const payload = cleanUndefined({
    title: input.title.trim(),
    tagline: normalizeString(input.tagline ?? undefined),
    description: input.description ?? undefined,
    slug: normalizeSlug(input.slug ?? undefined),
    link_url: normalizeString(input.linkUrl ?? undefined),
    hero_image_url: normalizeString(input.heroImageUrl ?? undefined),
    tags: normalizeStringArray(input.tags ?? undefined),
    display_order:
      input.displayOrder === undefined || input.displayOrder === null
        ? null
        : Number.isFinite(input.displayOrder)
          ? input.displayOrder
          : null,
    is_featured:
      input.isFeatured === undefined ? undefined : Boolean(input.isFeatured),
    status: statusValue,
    updated_at: new Date().toISOString(),
  });

  let response;
  if (input.id) {
    response = await supabase
      .from("projects")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
  } else {
    response = await supabase
      .from("projects")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        is_featured: payload.is_featured ?? false,
        status: payload.status ?? "draft",
      })
      .select("*")
      .single();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  resetSupabaseContentCache();
  return response.data;
};

export const deleteProjectRecord = async (id: string) => {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  resetSupabaseContentCache();
};

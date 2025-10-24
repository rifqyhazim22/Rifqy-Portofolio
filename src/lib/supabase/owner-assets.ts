import { createSupabaseServiceClient } from "./service-client";

export type MediaAssetStatus = "draft" | "published" | "archived";

export type MediaAssetRecord = {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  file_path: string;
  type: "image" | "video" | "audio" | "document" | "other";
  mime_type: string | null;
  alt_text: string | null;
  status: MediaAssetStatus;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const clean = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;

const normalizeStatus = (value?: string | null): MediaAssetStatus => {
  switch (value) {
    case "published":
    case "archived":
      return value;
    default:
      return "draft";
  }
};

const normalizeType = (mime?: string | null) => {
  if (!mime) return "other" as const;
  if (mime.startsWith("image/")) return "image" as const;
  if (mime.startsWith("video/")) return "video" as const;
  if (mime.startsWith("audio/")) return "audio" as const;
  if (mime === "application/pdf" || mime.startsWith("application/")) return "document" as const;
  return "other" as const;
};

export const listMediaAssets = async (): Promise<MediaAssetRecord[]> => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MediaAssetRecord[];
};

export type UpsertMediaAssetInput = {
  id?: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  filePath: string;
  mimeType?: string | null;
  altText?: string | null;
  status?: MediaAssetStatus;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
};

export const upsertMediaAssetRecord = async (input: UpsertMediaAssetInput) => {
  const supabase = createSupabaseServiceClient();

  const payload = clean({
    slug: input.slug?.trim() || null,
    title: input.title?.trim() || null,
    description: input.description?.trim() || null,
    file_path: input.filePath,
    mime_type: input.mimeType ?? null,
    type: normalizeType(input.mimeType ?? undefined),
    alt_text: input.altText?.trim() || null,
    status: normalizeStatus(input.status),
    tags: input.tags ?? null,
    metadata: input.metadata ?? null,
    updated_at: new Date().toISOString(),
  });

  let response;
  if (input.id) {
    response = await supabase
      .from("media_assets")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
  } else {
    response = await supabase
      .from("media_assets")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data as MediaAssetRecord;
};

export const deleteMediaAssetRecord = async (id: string) => {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};

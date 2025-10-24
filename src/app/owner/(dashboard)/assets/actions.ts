"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireOwner } from "@/lib/supabase";
import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  deleteMediaAssetRecord,
  upsertMediaAssetRecord,
  type MediaAssetRecord,
  type MediaAssetStatus,
} from "@/lib/supabase/owner-assets";

const BUCKET_NAME = "owner-assets";

const sanitizeFilename = (name: string) => name.toLowerCase().replace(/[^a-z0-9.\-_/]+/g, "-");

export type RequestUploadResult = {
  path: string;
  uploadUrl: string;
  token: string;
};

export async function requestAssetUploadAction(input: {
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<RequestUploadResult> {
  if (!input?.filename || !input.contentType) {
    throw new Error("Missing filename or content type");
  }

  await requireOwner();

  const supabase = createSupabaseServiceClient();
  const safeName = sanitizeFilename(input.filename);
  const folder = input.folder?.replace(/\/+$/, "") ?? "uploads";
  const path = `${folder}/${randomUUID()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create upload URL");
  }

  return {
    path,
    uploadUrl: data.signedUrl,
    token: data.token,
  };
}

export async function confirmAssetUploadAction(input: {
  path: string;
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
  status?: MediaAssetStatus;
  mimeType?: string;
}): Promise<{ asset: MediaAssetRecord }> {
  if (!input?.path) {
    throw new Error("Missing asset path");
  }

  await requireOwner();

  const asset = await upsertMediaAssetRecord({
    filePath: input.path,
    title: input.title,
    description: input.description,
    altText: input.altText,
    status: input.status,
    mimeType: input.mimeType,
    tags: input.tags ?? null,
  });

  revalidatePath("/owner/assets");
  revalidatePath("/owner");

  return { asset };
}

export async function updateAssetMetadataAction(input: {
  id: string;
  title?: string;
  description?: string;
  altText?: string;
  status?: MediaAssetStatus;
  tags?: string[];
  slug?: string | null;
}): Promise<{ asset: MediaAssetRecord }> {
  if (!input?.id) {
    throw new Error("Missing asset id");
  }

  await requireOwner();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("media_assets").select("file_path, mime_type").eq("id", input.id).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Asset not found");
  }

  const asset = await upsertMediaAssetRecord({
    id: input.id,
    filePath: data.file_path,
    mimeType: data.mime_type ?? undefined,
    title: input.title,
    description: input.description,
    altText: input.altText,
    status: input.status,
    tags: input.tags ?? null,
    slug: input.slug ?? null,
  });

  revalidatePath("/owner/assets");
  revalidatePath("/owner");

  return { asset };
}

export async function deleteAssetAction(id: string) {
  if (!id) {
    throw new Error("Missing asset id");
  }

  await requireOwner();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Asset not found");
  }

  await deleteMediaAssetRecord(id);
  await supabase.storage.from(BUCKET_NAME).remove([data.file_path]);

  revalidatePath("/owner/assets");
  revalidatePath("/owner");

  return { success: true };
}

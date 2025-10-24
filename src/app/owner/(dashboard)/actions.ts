"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/supabase";
import {
  updateSiteSectionRecord,
  createSiteSectionRecord,
  upsertProjectRecord,
  deleteProjectRecord,
  type UpsertProjectInput as OwnerProjectInput,
  type SiteSectionUpdateInput,
} from "@/lib/supabase/owner-content";

type UpdateSiteSectionInput = {
  id: string;
  title?: string;
  body?: string;
  metadataJson?: string | null;
  status?: "draft" | "published";
};

export async function updateSiteSectionAction(input: UpdateSiteSectionInput) {
  if (!input?.id) {
    throw new Error("Missing section id");
  }

  await requireOwner();

  const payload: SiteSectionUpdateInput = {
    id: input.id,
    title: input.title,
    body: input.body,
    status: input.status,
  };

  if (input.metadataJson !== undefined) {
    if (input.metadataJson && input.metadataJson.trim()) {
      try {
        payload.metadata = JSON.parse(input.metadataJson);
      } catch (error) {
        throw new Error("Metadata must be valid JSON");
      }
    } else {
      payload.metadata = null;
    }
  }

  await updateSiteSectionRecord(payload);
  revalidatePath("/owner/content");
  revalidatePath("/owner");

  return { success: true };
}

export async function createSiteSectionAction(slug: string) {
  const value = slug?.trim();
  if (!value) {
    throw new Error("Slug is required");
  }

  await requireOwner();

  await createSiteSectionRecord({ slug: value, status: "draft" });
  revalidatePath("/owner/content");
  revalidatePath("/owner");

  return { success: true };
}

export async function upsertProjectAction(input: OwnerProjectInput) {
  await requireOwner();

  await upsertProjectRecord(input);
  revalidatePath("/owner/content");
  revalidatePath("/owner");

  return { success: true };
}

export async function deleteProjectAction(id: string) {
  if (!id) throw new Error("Missing project id");

  await requireOwner();

  await deleteProjectRecord(id);
  revalidatePath("/owner/content");
  revalidatePath("/owner");
  return { success: true };
}

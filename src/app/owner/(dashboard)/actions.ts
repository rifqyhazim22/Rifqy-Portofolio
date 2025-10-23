"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/supabase";
import {
  updateSiteSectionRecord,
  upsertProjectRecord,
  upsertTestimonialRecord,
  deleteProjectRecord,
  deleteTestimonialRecord,
  type UpsertProjectInput as OwnerProjectInput,
  type UpsertTestimonialInput as OwnerTestimonialInput,
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
  revalidatePath("/owner");

  return { success: true };
}

export async function upsertProjectAction(input: OwnerProjectInput) {
  await requireOwner();

  await upsertProjectRecord(input);
  revalidatePath("/owner");

  return { success: true };
}

export async function upsertTestimonialAction(
  input: OwnerTestimonialInput,
) {
  await requireOwner();

  await upsertTestimonialRecord(input);
  revalidatePath("/owner");

  return { success: true };
}

export async function deleteProjectAction(id: string) {
  if (!id) throw new Error("Missing project id");

  await requireOwner();

  await deleteProjectRecord(id);
  revalidatePath("/owner");
  return { success: true };
}

export async function deleteTestimonialAction(id: string) {
  if (!id) throw new Error("Missing testimonial id");

  await requireOwner();

  await deleteTestimonialRecord(id);
  revalidatePath("/owner");
  return { success: true };
}

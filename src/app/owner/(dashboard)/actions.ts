"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";
import { resetSupabaseContentCache } from "@/lib/supabase/content";

const ensureOwner = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmail = process.env.SUPABASE_OWNER_EMAIL?.toLowerCase();

  if (!user || (allowedEmail && user.email?.toLowerCase() !== allowedEmail)) {
    throw new Error("Unauthorized");
  }

  return user;
};

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

  await ensureOwner();

  let metadata: Record<string, unknown> | null = null;

  if (input.metadataJson) {
    try {
      metadata = JSON.parse(input.metadataJson);
    } catch (error) {
      throw new Error("Metadata must be valid JSON");
    }
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("site_sections")
    .update({
      title: input.title?.trim() ?? null,
      body: input.body ?? null,
      metadata,
      status: input.status ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  revalidatePath("/owner");

  return { success: true };
}

type UpsertProjectInput = {
  id?: string;
  title: string;
  tagline?: string;
  description?: string;
  slug?: string;
  linkUrl?: string;
  heroImageUrl?: string;
  tags?: string[];
  displayOrder?: number;
  isFeatured?: boolean;
  status?: "draft" | "published";
};

export async function upsertProjectAction(input: UpsertProjectInput) {
  await ensureOwner();

  const supabase = createSupabaseServiceClient();
  const payload = {
    title: input.title.trim(),
    tagline: input.tagline?.trim() ?? null,
    description: input.description ?? null,
    slug: input.slug?.trim().toLowerCase() ?? null,
    link_url: input.linkUrl?.trim() ?? null,
    hero_image_url: input.heroImageUrl ?? null,
    tags: input.tags ?? null,
    display_order: input.displayOrder ?? null,
    is_featured: input.isFeatured ?? false,
    status: input.status ?? "draft",
    updated_at: new Date().toISOString(),
  };

  const { error } = input.id
    ? await supabase.from("projects").update(payload).eq("id", input.id)
    : await supabase
        .from("projects")
        .insert({ ...payload, created_at: new Date().toISOString() });

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  revalidatePath("/owner");

  return { success: true };
}

type UpsertTestimonialInput = {
  id?: string;
  name: string;
  role?: string;
  company?: string;
  quote: string;
  avatarUrl?: string;
  displayOrder?: number;
  status?: "draft" | "published";
};

export async function upsertTestimonialAction(input: UpsertTestimonialInput) {
  await ensureOwner();

  const supabase = createSupabaseServiceClient();
  const payload = {
    name: input.name.trim(),
    role: input.role?.trim() ?? null,
    company: input.company?.trim() ?? null,
    quote: input.quote,
    avatar_url: input.avatarUrl ?? null,
    display_order: input.displayOrder ?? null,
    status: input.status ?? "published",
    updated_at: new Date().toISOString(),
  };

  const { error } = input.id
    ? await supabase.from("testimonials").update(payload).eq("id", input.id)
    : await supabase
        .from("testimonials")
        .insert({ ...payload, created_at: new Date().toISOString() });

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  revalidatePath("/owner");

  return { success: true };
}

export async function deleteProjectAction(id: string) {
  if (!id) throw new Error("Missing project id");

  await ensureOwner();

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  revalidatePath("/owner");
  return { success: true };
}

export async function deleteTestimonialAction(id: string) {
  if (!id) throw new Error("Missing testimonial id");

  await ensureOwner();

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  resetSupabaseContentCache();
  revalidatePath("/owner");
  return { success: true };
}

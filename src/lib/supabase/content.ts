import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceClient } from "./service-client";

export type SiteSectionRecord = {
  id: string;
  slug: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  updated_at: string | null;
};

export type ProjectRecord = {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  slug: string | null;
  link_url: string | null;
  hero_image_url: string | null;
  tags: string[] | null;
  display_order: number | null;
  is_featured: boolean | null;
  status: string | null;
  updated_at: string | null;
};

export type TestimonialRecord = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  display_order: number | null;
  status: string | null;
  updated_at: string | null;
};

type MaybeClient = SupabaseClient | null;

const cache = new Map<string, Promise<unknown>>();

const getClient = (): MaybeClient => getSupabaseServiceClient();

const cached = <T>(key: string, loader: () => Promise<T>): Promise<T> => {
  if (!cache.has(key)) {
    cache.set(key, loader());
  }
  return cache.get(key)! as Promise<T>;
};

export const fetchSiteSections = async (
  slugs: string[],
  options: { includeDrafts?: boolean } = {},
): Promise<Record<string, SiteSectionRecord>> => {
  const client = getClient();
  if (!client || slugs.length === 0) {
    return {};
  }

  const key = `site_sections:${slugs.sort().join(",")}:${options.includeDrafts ? "all" : "published"}`;

  const data = await cached(key, async () => {
    const query = client
      .from("site_sections")
      .select("*")
      .in("slug", slugs);

    if (!options.includeDrafts) {
      query.eq("status", "published");
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load site sections", error);
      return [];
    }
    return data ?? [];
  });

  return (data as SiteSectionRecord[]).reduce<Record<string, SiteSectionRecord>>((acc, record) => {
    acc[record.slug] = record;
    return acc;
  }, {});
};

export const fetchPublishedProjects = async (): Promise<ProjectRecord[]> => {
  const client = getClient();
  if (!client) return [];

  return cached("projects:published", async () => {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load projects", error);
      return [];
    }
    return data ?? [];
  }) as Promise<ProjectRecord[]>;
};

export const fetchFeaturedProjects = async (): Promise<ProjectRecord[]> => {
  const client = getClient();
  if (!client) return [];

  return cached("projects:featured", async () => {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load featured projects", error);
      return [];
    }
    return data ?? [];
  }) as Promise<ProjectRecord[]>;
};

export const fetchPublishedTestimonials = async (): Promise<TestimonialRecord[]> => {
  const client = getClient();
  if (!client) return [];

  return cached("testimonials:published", async () => {
    const { data, error } = await client
      .from("testimonials")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load testimonials", error);
      return [];
    }
    return data ?? [];
  }) as Promise<TestimonialRecord[]>;
};

export const resetSupabaseContentCache = () => {
  cache.clear();
};

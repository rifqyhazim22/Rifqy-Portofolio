import { createSupabaseServiceClient } from "./service-client";

export type AiAgentRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: "chat" | "librarian" | "other";
  status: "active" | "disabled" | "draft";
  model: string | null;
  system_prompt: string | null;
  max_output_tokens: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const client = () => createSupabaseServiceClient();

export const listAiAgents = async (): Promise<AiAgentRecord[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("ai_agents")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AiAgentRecord[];
};

export const fetchAiAgentBySlug = async (slug: string): Promise<AiAgentRecord | null> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as AiAgentRecord | null;
};

export type UpsertAiAgentInput = {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  type?: "chat" | "librarian" | "other";
  status?: "active" | "disabled" | "draft";
  model?: string | null;
  system_prompt?: string | null;
  max_output_tokens?: number | null;
  metadata?: Record<string, unknown> | null;
};

export const upsertAiAgentRecord = async (input: UpsertAiAgentInput) => {
  const supabase = client();
  const payload = {
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    type: input.type ?? "other",
    status: input.status ?? "active",
    model: input.model ?? null,
    system_prompt: input.system_prompt ?? null,
    max_output_tokens: input.max_output_tokens ?? null,
    metadata: input.metadata ?? null,
  };

  const query = input.id
    ? supabase
        .from("ai_agents")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .single()
    : supabase
        .from("ai_agents")
        .upsert(payload, { onConflict: "slug" })
        .select("*")
        .single();

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data as AiAgentRecord;
};

export const deleteAiAgentRecord = async (id: string) => {
  const supabase = client();
  const { error } = await supabase.from("ai_agents").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};

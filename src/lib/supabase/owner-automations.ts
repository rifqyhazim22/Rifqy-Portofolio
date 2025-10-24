import { createSupabaseServiceClient } from "./service-client";

export type AutomationStatus = "draft" | "active" | "archived";

export type AutomationRecord = {
  id: string;
  name: string;
  description: string | null;
  definition: Record<string, unknown>;
  status: AutomationStatus;
  created_at: string;
  updated_at: string;
};

const clean = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;

export const listAutomations = async (): Promise<AutomationRecord[]> => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AutomationRecord[];
};

export type UpsertAutomationInput = {
  id?: string;
  name: string;
  description?: string | null;
  definition?: Record<string, unknown>;
  status?: AutomationStatus;
};

export const upsertAutomationRecord = async (input: UpsertAutomationInput) => {
  const supabase = createSupabaseServiceClient();

  const payload = clean({
    name: input.name.trim(),
    description: input.description ?? null,
    definition: input.definition ?? {},
    status: input.status ?? "draft",
    updated_at: new Date().toISOString(),
  });

  let response;
  if (input.id) {
    response = await supabase
      .from("automations")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
  } else {
    response = await supabase
      .from("automations")
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

  return response.data as AutomationRecord;
};

export const deleteAutomationRecord = async (id: string) => {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("automations").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};

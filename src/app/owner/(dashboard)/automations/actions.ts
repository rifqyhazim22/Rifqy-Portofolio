"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/supabase";
import {
  deleteAutomationRecord,
  listAutomations,
  upsertAutomationRecord,
  type AutomationRecord,
  type AutomationStatus,
} from "@/lib/supabase/owner-automations";

export type AutomationDefinition = {
  nodes: unknown[];
  edges: unknown[];
  viewport?: Record<string, unknown>;
};

export async function fetchAutomationsAction(): Promise<AutomationRecord[]> {
  await requireOwner();
  return listAutomations();
}

export async function createAutomationAction({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  await requireOwner();
  const automation = await upsertAutomationRecord({ name, description });
  revalidatePath("/owner/automations");
  revalidatePath("/owner");
  return automation;
}

export async function saveAutomationAction(input: {
  id: string;
  name: string;
  description?: string;
  status?: AutomationStatus;
  definition: AutomationDefinition;
}) {
  if (!input?.id) {
    throw new Error("Missing automation id");
  }

  await requireOwner();
  const automation = await upsertAutomationRecord({
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status,
    definition: input.definition,
  });
  revalidatePath("/owner/automations");
  revalidatePath("/owner");
  return automation;
}

export async function deleteAutomationAction(id: string) {
  if (!id) {
    throw new Error("Missing automation id");
  }

  await requireOwner();
  await deleteAutomationRecord(id);
  revalidatePath("/owner/automations");
  revalidatePath("/owner");
  return { success: true };
}

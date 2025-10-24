"use server";

import { revalidatePath } from "next/cache";
import { requireOwner, upsertAiAgentRecord } from "@/lib/supabase";
import type { AiAgentRecord } from "@/lib/supabase/agents";
import { logAiAgentVersion } from "@/lib/supabase";

const normalize = (value: string | null | undefined) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeNumber = (value: number | string | null | undefined) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export type UpdateChatAgentInput = {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "disabled" | "draft";
  model?: string | null;
  maxOutputTokens?: number | null;
  systemPrompt?: string | null;
  tonePrompts: {
    formal?: string;
    santai?: string;
    deep?: string;
  };
};

export async function updateChatAgentAction(input: UpdateChatAgentInput) {
  if (!input?.id) {
    throw new Error("Missing agent id");
  }

  const owner = await requireOwner();
  const editor = owner.email ?? owner.id;

  const metadata = {
    tonePrompts: {
      formal: input.tonePrompts.formal ?? "",
      santai: input.tonePrompts.santai ?? "",
      deep: input.tonePrompts.deep ?? "",
    },
  };

  const updated = await upsertAiAgentRecord({
    id: input.id,
    slug: "navigator",
    name: input.name.trim(),
    description: normalize(input.description) ?? null,
    type: "chat",
    status: input.status,
    model: normalize(input.model),
    system_prompt: normalize(input.systemPrompt),
    max_output_tokens: normalizeNumber(input.maxOutputTokens),
    metadata,
  });

  await logAiAgentVersion(updated, editor);

  revalidatePath("/owner/agents");
  revalidatePath("/owner");

  return { success: true };
}

export type UpdateLibrarianAgentInput = {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "disabled" | "draft";
  model?: string | null;
  maxOutputTokens?: number | null;
  instructions: {
    intro: { id: string; en: string };
    empathy: { id: string; en: string };
    pronoun: { id: string; en: string };
    tone: {
      default: { id: string; en: string };
      santai: { id: string; en: string };
      deep: { id: string; en: string };
    };
    lengthRule: { id: string; en: string };
    knowledgeInstruction: { id: string; en: string };
    fallback: { id: string; en: string };
    imageGuidance: { id: string; en: string };
    navigationRule: { id: string; en: string };
    contextLead: { id: string; en: string };
  };
};

export async function updateLibrarianAgentAction(input: UpdateLibrarianAgentInput) {
  if (!input?.id) {
    throw new Error("Missing agent id");
  }

  const owner = await requireOwner();
  const editor = owner.email ?? owner.id;

  const metadata = {
    instructions: input.instructions,
  };

  const updated = await upsertAiAgentRecord({
    id: input.id,
    slug: "librarian",
    name: input.name.trim(),
    description: normalize(input.description) ?? null,
    type: "librarian",
    status: input.status,
    model: normalize(input.model),
    system_prompt: null,
    max_output_tokens: normalizeNumber(input.maxOutputTokens),
    metadata,
  });

  await logAiAgentVersion(updated, editor);

  revalidatePath("/owner/agents");
  revalidatePath("/owner");

  return { success: true };
}

export type CreateAgentInput = {
  slug: string;
  name: string;
  type: "chat" | "librarian" | "other";
  description?: string | null;
  model?: string | null;
  systemPrompt?: string | null;
  metadataJson?: string | null;
};

export async function createAgentAction(input: CreateAgentInput) {
  if (!input?.slug?.trim()) {
    throw new Error("Slug is required");
  }
  if (!input?.name?.trim()) {
    throw new Error("Name is required");
  }

  const owner = await requireOwner();
  const editor = owner.email ?? owner.id;

  let metadata: AiAgentRecord["metadata"] = null;
  if (input.metadataJson && input.metadataJson.trim()) {
    try {
      metadata = JSON.parse(input.metadataJson) as AiAgentRecord["metadata"];
    } catch (error) {
      throw new Error("Metadata must be valid JSON");
    }
  }

  const created = await upsertAiAgentRecord({
    slug: input.slug.trim().toLowerCase(),
    name: input.name.trim(),
    description: normalize(input.description) ?? null,
    type: input.type,
    status: "draft",
    model: normalize(input.model),
    system_prompt: normalize(input.systemPrompt),
    metadata,
  });

  await logAiAgentVersion(created, editor);

  revalidatePath("/owner/agents");
  revalidatePath("/owner");

  return { success: true };
}

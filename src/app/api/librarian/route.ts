import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { findKnowledgeSnippets, knowledgeToContext } from "@/lib/knowledge";
import { createSupabaseServiceClient } from "@/lib/supabase";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ImageAttachment = {
  data: string;
  mimeType?: string;
  name?: string;
};

interface LibrarianRequest {
  messages: Message[];
  language?: "id" | "en";
  tone?: "formal" | "santai" | "deep";
  images?: ImageAttachment[];
  identity?: {
    name?: string;
    source?: string;
    email?: string;
  };
  page?: string;
}

const DEFAULT_LANGUAGE: "id" | "en" = "id";

function clampWords(text: string, maxWords: number): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) {
    return trimmed;
  }
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function buildSystemPrompt(language: "id" | "en", tone: "formal" | "santai" | "deep" | undefined, knowledge: string) {
  const pronounInstruction =
    language === "id"
      ? 'Gunakan "aku" saat merujuk pada dirimu sebagai agent perpustakaan digital ini, sebut Rifqy sebagai pihak ketiga (Rifqy/ beliau), sapa pengunjung dengan "kamu", dan jangan pernah menyebut pengunjung sebagai agent.'
      : "Use “I/me” for yourself as the site’s library agent, refer to Rifqy in the third person (Rifqy/he), address the visitor as “you”, and never label the visitor as the agent.";
  const toneHint =
    tone === "santai"
      ? language === "id"
        ? "Terapkan nada santai namun tetap profesional dan empatik."
        : "Lean into a relaxed yet warm tone."
      : tone === "deep"
        ? language === "id"
          ? "Bangun suasana yang dalam dan reflektif tanpa berlebihan."
          : "Use a reflective tone that still feels approachable."
        : language === "id"
          ? "Pertahankan nada profesional yang hangat."
          : "Use a confident, warm professional tone.";
  const knowledgeInstruction =
    language === "id"
      ? "Jika menjawab berdasarkan referensi situs, sertakan path halaman di dalam tanda kurung, contoh: (/about)."
      : "When citing site references, include the page path inside parentheses, e.g., (/about).";

  const fallback =
    language === "id"
      ? "Jika kamu belum punya data, jelaskan dengan jujur tanpa mengada-ada dan tawarkan opsi lanjutan seperti menjadwalkan diskusi atau memperbarui dokumen."
      : "If information is missing, say so transparently and suggest follow-ups such as scheduling a chat or updating the documents.";

  const imageGuidance =
    language === "id"
      ? "Kalau pengunjung mengunggah gambar, sampaikan observasi utama dalam maksimal tiga kalimat. Jika konteks belum jelas, ajukan pertanyaan singkat."
      : "If the visitor shares an image, describe the key observations in no more than three sentences. Ask for clarification briefly when needed.";

  const lengthRule =
    language === "id"
      ? "Batasi jawaban maksimal 120 kata atau empat kalimat. Mulai dengan jawaban inti, lanjutkan insight ringkas, tawarkan bantuan lanjutan seperlunya, dan gunakan maksimal dua emoji yang benar-benar relevan dengan kalimatnya."
      : "Keep the reply under 120 words or four sentences. Lead with the core answer, add concise insight, offer follow-up only if useful, and use at most two emojis that directly support the lines they’re attached to.";

  return [
    language === "id"
      ? "Kamu adalah penjaga perpustakaan digital Rifqy Hazim HR—AI librarian yang mengenal CV, portofolio, dan seluruh narasi website."
      : "You are the digital librarian for Rifqy Hazim HR—you know his CV, portfolio, and all narratives on the website.",
    "Jagalah empati, sambut pengunjung layaknya tamu istimewa, dan bantu mereka memahami misi Freedom of Intelligence.",
    pronounInstruction,
    toneHint,
    lengthRule,
    knowledgeInstruction,
    fallback,
    imageGuidance,
    language === "id"
      ? "Jangan membuat directive navigasi atau format [[NAVIGATE]]."
      : "Do not produce navigation directives or the [[NAVIGATE]] format.",
    language === "id"
      ? "Berikut konteks perpustakaan yang bisa kamu gunakan:"
      : "Here is the library context you can rely on:",
    knowledge,
  ].join("\n");
}

function prepareMessages(messages: Message[], images: ImageAttachment[] | undefined) {
  const prepared = messages.map((message, index) => {
    const baseContent = [
      {
        type: message.role === "assistant" ? ("output_text" as const) : ("input_text" as const),
        text: message.content,
      },
    ];

    if (index === messages.length - 1 && images?.length && message.role === "user") {
      const imageContent = images.slice(0, 3).map((image) => ({
        type: "input_image" as const,
        image_url: `data:${image.mimeType ?? "image/png"};base64,${image.data}`,
        detail: "auto" as const,
      }));

      return {
        role: message.role,
        content: [...baseContent, ...imageContent],
      };
    }

    return {
      role: message.role,
      content: baseContent,
    };
  });

  return prepared;
}

type AgentSessionLog = {
  identity?: LibrarianRequest["identity"];
  intent?: string;
  language: "id" | "en";
  tone?: "formal" | "santai" | "deep";
  page?: string;
};

async function logAgentSession(log: AgentSessionLog) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from("agent_sessions").insert({
      visitor_name: log.identity?.name?.slice(0, 160) ?? null,
      visitor_email: log.identity?.email?.slice(0, 160) ?? null,
      referrer: (log.identity?.source ?? log.page)?.slice(0, 255) ?? null,
      agent_type: "librarian",
      intent: log.intent ? clampWords(log.intent, 32) : null,
      metadata: {
        page: log.page ?? null,
        language: log.language,
        tone: log.tone ?? null,
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log agent session", error);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as LibrarianRequest | null;

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const language = body.language ?? DEFAULT_LANGUAGE;

  if (!client.apiKey) {
    const message =
      language === "id"
        ? "Konfigurasi OpenAI API key belum tersedia."
        : "OpenAI API key is not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const lastUserMessage = [...body.messages].reverse().find((message) => message.role === "user");
    const knowledgeEntries = findKnowledgeSnippets(lastUserMessage?.content, 3);
    const knowledgeContext = knowledgeToContext(knowledgeEntries, language);

    const systemPrompt = buildSystemPrompt(language, body.tone, knowledgeContext);

    const history = prepareMessages(body.messages, body.images);
    const input = [
      {
        role: "system" as const,
        content: [{ type: "input_text" as const, text: systemPrompt }],
      },
      ...history,
    ];

    const response = await client.responses.create({
      model: "gpt-5-nano",
      max_output_tokens: 3200,
      input: input as any,
    });

    if (response.status !== "completed" || !response.output_text?.trim()) {
      throw new Error(`librarian model incomplete: ${response.incomplete_details?.reason ?? "unknown reason"}`);
    }

    const message = clampWords(response.output_text.trim(), 140);

    await logAgentSession({
      identity: body.identity,
      intent: lastUserMessage?.content,
      language,
      tone: body.tone,
      page: body.page,
    });

    return NextResponse.json({
      message,
      knowledge: knowledgeEntries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        paths: entry.source.paths,
      })),
    });
  } catch (error) {
    console.error("Librarian agent error", error);

    if (error instanceof OpenAI.APIError) {
      const isImageIssue = typeof error.param === "string" && error.param.includes("image");
      const friendly =
        language === "id"
          ? isImageIssue
            ? "Gambar tidak bisa diproses. Pastikan formatnya PNG atau JPEG dan coba unggah ulang."
            : "Agent OpenAI menolak permintaan ini. Coba lagi sebentar lagi."
          : isImageIssue
            ? "The image could not be processed. Please ensure it is a PNG or JPEG and try uploading again."
            : "The OpenAI service rejected this request. Please try again in a moment.";
      const status = error.status ?? 400;
      return NextResponse.json({ error: friendly }, { status: status >= 500 ? status : 400 });
    }

    const fallback =
      language === "id"
        ? "Agent tidak bisa dihubungi sekarang. Coba lagi beberapa saat."
        : "The agent is temporarily unavailable. Please try again shortly.";
    return NextResponse.json({ error: fallback }, { status: 500 });
  }
}

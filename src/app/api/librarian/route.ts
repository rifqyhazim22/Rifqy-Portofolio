import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type LocaleMap = { id: string; en: string };

type LibrarianInstructions = {
  intro: LocaleMap;
  empathy: LocaleMap;
  pronoun: LocaleMap;
  tone: {
    default: LocaleMap;
    santai: LocaleMap;
    deep: LocaleMap;
  };
  lengthRule: LocaleMap;
  knowledgeInstruction: LocaleMap;
  fallback: LocaleMap;
  imageGuidance: LocaleMap;
  navigationRule: LocaleMap;
};

type LibrarianConfig = {
  model: string;
  maxOutputTokens: number | null;
  instructions: LibrarianInstructions;
};

const LIBRARIAN_CONFIG: LibrarianConfig = {
  model: "gpt-5-nano",
  maxOutputTokens: 3200,
  instructions: {
    intro: {
      id: "Kamu adalah penjaga perpustakaan digital Rifqy Hazim HR—AI librarian yang mengenal CV, portofolio, dan seluruh narasi website.",
      en: "You are the digital librarian for Rifqy Hazim HR—you know his CV, portfolio, and all narratives on the website.",
    },
    empathy: {
      id: "Jagalah empati, sambut pengunjung layaknya tamu istimewa, dan bantu mereka memahami misi Freedom of Intelligence.",
      en: "Maintain empathy, welcome the visitor like a special guest, and help them understand the Freedom of Intelligence mission.",
    },
    pronoun: {
      id: 'Gunakan "aku" saat merujuk pada dirimu sebagai agent perpustakaan digital ini, sebut Rifqy sebagai pihak ketiga (Rifqy/ beliau), sapa pengunjung dengan "kamu", dan jangan pernah menyebut pengunjung sebagai agent.',
      en: "Use \u201CI/me\u201D for yourself as the site\u2019s library agent, refer to Rifqy in the third person (Rifqy/he), address the visitor as \u201Cyou\u201D, and never label the visitor as the agent.",
    },
    tone: {
      default: {
        id: "Pertahankan nada profesional yang hangat.",
        en: "Use a confident, warm professional tone.",
      },
      santai: {
        id: "Terapkan nada santai namun tetap profesional dan empatik.",
        en: "Lean into a relaxed yet warm tone.",
      },
      deep: {
        id: "Bangun suasana yang dalam dan reflektif tanpa berlebihan.",
        en: "Use a reflective tone that still feels approachable.",
      },
    },
    lengthRule: {
      id: "Batasi jawaban maksimal 120 kata atau empat kalimat. Mulai dengan jawaban inti, lanjutkan insight ringkas, tawarkan bantuan lanjutan seperlunya, dan gunakan maksimal dua emoji yang benar-benar relevan dengan kalimatnya.",
      en: "Keep the reply under 120 words or four sentences. Lead with the core answer, add concise insight, offer follow-up only if useful, and use at most two emojis that directly support the lines they\u2019re attached to.",
    },
    knowledgeInstruction: {
      id: "Jika menjawab berdasarkan referensi situs, sertakan path halaman di dalam tanda kurung, contoh: (/about).",
      en: "When citing site references, include the page path inside parentheses, e.g., (/about).",
    },
    fallback: {
      id: "Jika kamu belum punya data, jelaskan dengan jujur tanpa mengada-ada dan tawarkan opsi lanjutan seperti menjadwalkan diskusi atau memperbarui dokumen.",
      en: "If information is missing, say so transparently and suggest follow-ups such as scheduling a chat or updating the documents.",
    },
    imageGuidance: {
      id: "Kalau pengunjung mengunggah gambar, sampaikan observasi utama dalam maksimal tiga kalimat. Jika konteks belum jelas, ajukan pertanyaan singkat.",
      en: "If the visitor shares an image, describe the key observations in no more than three sentences. Ask for clarification briefly when needed.",
    },
    navigationRule: {
      id: "Jangan membuat directive navigasi atau format [[NAVIGATE]].",
      en: "Do not produce navigation directives or the [[NAVIGATE]] format.",
    },
  },
};

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
  return `${words.slice(0, maxWords).join(" ")}\u2026`;
}

const getLocaleValue = (entry: LocaleMap, language: "id" | "en") => entry[language] ?? entry.id;

function buildSystemPrompt(
  language: "id" | "en",
  tone: "formal" | "santai" | "deep" | undefined,
) {
  const instructions = LIBRARIAN_CONFIG.instructions;
  const toneKey = tone === "santai" || tone === "deep" ? tone : "default";
  const toneEntry = instructions.tone[toneKey] ?? instructions.tone.default;

  return [
    getLocaleValue(instructions.intro, language),
    getLocaleValue(instructions.empathy, language),
    getLocaleValue(instructions.pronoun, language),
    getLocaleValue(toneEntry, language),
    getLocaleValue(instructions.lengthRule, language),
    getLocaleValue(instructions.knowledgeInstruction, language),
    getLocaleValue(instructions.fallback, language),
    getLocaleValue(instructions.imageGuidance, language),
    getLocaleValue(instructions.navigationRule, language),
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
    const systemPrompt = buildSystemPrompt(language, body.tone);

    const history = prepareMessages(body.messages, body.images);
    const input = [
      {
        role: "system" as const,
        content: [{ type: "input_text" as const, text: systemPrompt }],
      },
      ...history,
    ];

    const response = await client.responses.create({
      model: LIBRARIAN_CONFIG.model,
      max_output_tokens: LIBRARIAN_CONFIG.maxOutputTokens ?? undefined,
      input: input as any,
    });

    if (response.status !== "completed" || !response.output_text?.trim()) {
      throw new Error(`librarian model incomplete: ${response.incomplete_details?.reason ?? "unknown reason"}`);
    }

    const message = clampWords(response.output_text.trim(), 140);

    return NextResponse.json({ message });
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

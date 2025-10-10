import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { findKnowledgeSnippets, knowledgeToContext } from "@/lib/knowledge";

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
}

const DEFAULT_LANGUAGE: "id" | "en" = "id";

function buildSystemPrompt(language: "id" | "en", tone: "formal" | "santai" | "deep" | undefined, knowledge: string) {
  const pronounInstruction =
    language === "id"
      ? 'Gunakan kata ganti "aku" saat bicara sebagai Rifqy dan "kamu" saat menyapa pengunjung.'
      : 'Use first-person “I” when representing Rifqy and address the visitor as “you”.';
  const completeness =
    language === "id"
      ? "Jawabanmu harus lebih lengkap dibanding agent mengambang di pojok kanan bawah."
      : "Your replies must be more comprehensive than the floating agent on the lower-right corner.";
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
      ? "Kalau pengunjung mengunggah gambar, jelaskan apa yang bisa kamu amati atau tanyakan klarifikasi jika konteksnya belum jelas."
      : "If the visitor shares an image, describe what you can observe or ask for clarification if the context is unclear.";

  return [
    language === "id"
      ? "Kamu adalah penjaga perpustakaan digital Rifqy Hazim HR—AI librarian yang mengenal CV, portofolio, dan seluruh narasi website."
      : "You are the digital librarian for Rifqy Hazim HR—you know his CV, portfolio, and all narratives on the website.",
    "Jagalah empati, sambut pengunjung layaknya tamu istimewa, dan bantu mereka memahami misi Freedom of Intelligence.",
    pronounInstruction,
    completeness,
    toneHint,
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
    const baseContent = [{ type: "input_text" as const, text: message.content }];

    if (index === messages.length - 1 && images?.length && message.role === "user") {
      const imageContent = images.slice(0, 3).map((image) => ({
        type: "input_image" as const,
        image: {
          b64_json: image.data,
          mime_type: image.mimeType ?? "image/png",
        },
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

  try {
    const lastUserMessage = [...body.messages].reverse().find((message) => message.role === "user");
    const knowledgeEntries = findKnowledgeSnippets(lastUserMessage?.content, 4);
    const knowledgeContext = knowledgeToContext(knowledgeEntries);

    const systemPrompt = buildSystemPrompt(language, body.tone, knowledgeContext);

    const input = [
      {
        role: "system" as const,
        content: [{ type: "input_text" as const, text: systemPrompt }],
      },
      ...prepareMessages(body.messages, body.images),
    ];

    const response = await client.responses.create({
      model: "gpt-5-nano",
      max_output_tokens: 800,
      input,
    });

    const message = response.output_text?.trim();

    if (!message) {
      throw new Error("Empty response from model");
    }

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
    const message =
      language === "id"
        ? "Agent tidak bisa dihubungi sekarang. Coba lagi beberapa saat."
        : "The agent is temporarily unavailable. Please try again shortly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

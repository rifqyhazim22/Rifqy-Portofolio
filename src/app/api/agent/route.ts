import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import navigationEmbeddings from "@/content/navigation/embeddings.json";
import navigationConfig from "@/content/navigation/config.json";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ChatAgentConfig = {
  systemPrompt: string;
  tonePrompts: Record<string, string>;
  maxOutputTokens: number;
  model: string;
};

const CHAT_AGENT_CONFIG: ChatAgentConfig = {
  systemPrompt: `You are the AI agent for Rifqy Hazim HR's portfolio website.
- "HR" in the brand stands for Haidar Ramadhan (part of his full name), not Human Resources.
- Rifqy Hazim HR is an AI engineer focused on prompt engineering, agent orchestration, and web delivery—keep that positioning clear.
- Introduce yourself (when needed) as Rifqy's AI agent. Use "I/me" for yourself, keep Rifqy in third person (he/him), and never imply the visitor is the agent.
- Reply in the visitor's language with high-signal guidance only.
- Hard limit: 3 sentences or 90 words. Lead with the direct answer and keep paragraphs tight.
- Use a short bullet list only when it clearly improves clarity (e.g., multiple options).
- When helpful, mention at most one section to explore using the format "Explore: /path".
- If the visitor explicitly wants to navigate, append [[NAVIGATE:/path]] using the closest official route. Ask for clarification if uncertain.
- Be transparent when information is missing and offer a brief follow-up suggestion.
- Use up to two emojis, only when they reinforce the sentence they accompany. Place them right next to the relevant line.`,
  tonePrompts: {
    formal: "Stay confident and warm but keep sentences short and purposeful.",
    santai: "Keep it light and friendly with brief Indonesian-English phrases; avoid rambling.",
    deep: "Sound reflective yet concise—choose vivid words without adding extra length.",
  },
  maxOutputTokens: 3200,
  model: "gpt-5-nano",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentRequest = {
  messages: ChatMessage[];
  language?: "id" | "en";
  location?: string;
  tone?: "formal" | "santai" | "deep";
};

interface RouteConfig {
  route: string;
  aliases?: string[];
  keywords: string[];
}

interface NavigationEmbedding {
  route: string;
  title: string;
  description: string;
  embedding: number[];
}

const ROUTE_CONFIG: RouteConfig[] = [
  {
    route: "/",
    aliases: ["/home", "/beranda"],
    keywords: ["home", "beranda", "start", "awal", "hero"],
  },
  {
    route: "/about",
    aliases: ["/profile", "/tentang"],
    keywords: ["about", "profile", "bio", "story", "tentang"],
  },
  {
    route: "/works",
    keywords: ["works", "work", "portfolio", "prompt", "showcase", "deliverables", "project", "projects"],
  },
  {
    route: "/ai-agent",
    aliases: ["/librarian", "/agent"],
    keywords: ["agent", "ai", "librarian", "chat"],
  },
];

const KNOWN_ROUTES = new Set(ROUTE_CONFIG.map((config) => config.route));

const ROUTE_ALIAS_MAP = ROUTE_CONFIG.reduce<Record<string, string>>((acc, config) => {
  for (const alias of config.aliases ?? []) {
    acc[normalizePath(alias) ?? alias] = config.route;
  }
  return acc;
}, {});

const NAVIGATION_EMBEDDINGS = navigationEmbeddings as NavigationEmbedding[];
const EMBEDDING_THRESHOLD = 0.78;
const intentMemory = new Map<string, Map<string, number>>();
const ROUTE_MENU_TEXT = (navigationConfig as Array<{ title: string; route: string }>)
  .map((item) => `- ${item.title} (${item.route})`)
  .join("\n");

function clampWords(text: string, maxWords: number): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) {
    return trimmed;
  }
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function normalizePath(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\/$/, "").toLowerCase() || "/";
  }
  return ("/" + trimmed).replace(/\/$/, "").toLowerCase();
}

function normalizeQueryText(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function resolveNavigationByHeuristics(raw: string | null, messages: ChatMessage[]): string | null {
  let normalized = normalizePath(raw);
  if (normalized && ROUTE_ALIAS_MAP[normalized]) {
    normalized = ROUTE_ALIAS_MAP[normalized];
  }

  const candidateScores = new Map<string, number>();

  const consider = (route: string, score: number) => {
    candidateScores.set(route, Math.max(candidateScores.get(route) ?? 0, score));
  };

  if (normalized && KNOWN_ROUTES.has(normalized)) {
    consider(normalized, 6);
  }

  const evaluateString = (value: string, weight = 1) => {
    if (!value) return;
    const lower = value.toLowerCase();
    for (const config of ROUTE_CONFIG) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (lower.includes(keyword)) {
          score += 2;
        }
      }

      const tokens = lower.match(/[a-z0-9]+/g) ?? [];
      for (const token of tokens) {
        if (token === config.route.slice(1)) {
          score += 3;
        }
        for (const alias of config.aliases ?? []) {
          const aliasTokens = alias.toLowerCase().split("/").filter(Boolean);
          if (aliasTokens.some((aliasToken) => token === aliasToken)) {
            score += 2;
          }
        }
      }

      if (normalized) {
        const distance = levenshtein(lower, config.route);
        if (distance <= 3) {
          score += 3 - distance;
        }
      }

      if (score > 0) {
        consider(config.route, score * weight);
      }
    }
  };

  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content ?? "";
  evaluateString(normalized ?? "", 1.5);
  evaluateString(raw ?? "", 1.5);
  evaluateString(lastUserMessage, 2);

  const sorted = [...candidateScores.entries()].sort((a, b) => b[1] - a[1]);
  const [bestRoute, bestScore] = sorted[0] ?? [];
  if (bestRoute && bestScore >= 2) {
    return bestRoute;
  }

  return normalized && KNOWN_ROUTES.has(normalized) ? normalized : null;
}

function recordIntent(query: string | null, route: string | null) {
  if (!route) return;
  const key = normalizeQueryText(query);
  if (!key) return;
  const map = intentMemory.get(key) ?? new Map<string, number>();
  map.set(route, (map.get(route) ?? 0) + 1);
  intentMemory.set(key, map);
}

function resolveFromMemory(query: string | null): string | null {
  const key = normalizeQueryText(query);
  if (!key) return null;
  const direct = intentMemory.get(key);
  if (direct && direct.size > 0) {
    return [...direct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }

  let bestRoute: string | null = null;
  let bestScore = 0;

  for (const [storedKey, routes] of intentMemory.entries()) {
    if (!storedKey) continue;
    if (key.includes(storedKey) || storedKey.includes(key)) {
      const [route, score] = [...routes.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
      if (route && score && score > bestScore) {
        bestRoute = route;
        bestScore = score;
      }
    }
  }

  return bestRoute;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length && i < b.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function resolveNavigationTarget(raw: string | null, messages: ChatMessage[]): Promise<string | null> {
  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content ?? "";
  const query = raw?.trim()?.length ? raw : lastUserMessage;
  const normalizedQuery = normalizeQueryText(query);

  const memorySuggestion = resolveFromMemory(normalizedQuery) ?? resolveFromMemory(lastUserMessage);
  if (memorySuggestion) {
    recordIntent(normalizedQuery ?? lastUserMessage, memorySuggestion);
    return memorySuggestion;
  }

  const heuristic = resolveNavigationByHeuristics(raw, messages);
  if (heuristic) {
    recordIntent(normalizedQuery ?? lastUserMessage, heuristic);
    return heuristic;
  }

  if (!query?.trim()) {
    return null;
  }

  try {
    const resp = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = resp.data[0]?.embedding;
    if (!queryEmbedding) {
      return null;
    }

    let bestRoute: string | null = null;
    let bestScore = -Infinity;

    for (const item of NAVIGATION_EMBEDDINGS) {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestRoute = item.route;
      }
    }

    if (bestRoute && bestScore >= EMBEDDING_THRESHOLD) {
      recordIntent(normalizedQuery ?? lastUserMessage, bestRoute);
      return bestRoute;
    }
  } catch (error) {
    console.error("Embedding match failed", error);
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!client.apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 500 });
  }

  let payload: AgentRequest;
  try {
    payload = (await request.json()) as AgentRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { messages = [], language = "id", location, tone = "formal" } = payload;
  const normalizedTone = tone === "santai" || tone === "deep" ? tone : "formal";

  const locationDescriptions: Record<string, string> = {
    "/": "the home page (hero introduction, quotes, and latest highlights)",
    "/about": "the About page (story, timeline, capabilities, and testimonials)",
    "/works": "the Works & Projects gallery (selected deliverables and case studies)",
    "/ai-agent": "the AI Agent page (interactive chat with Rifqy's AI assistant)",
  };

  const locationContext = location
    ? locationDescriptions[location] ?? `the page at ${location}`
    : undefined;
  const toneDirective =
    CHAT_AGENT_CONFIG.tonePrompts[normalizedTone] ?? CHAT_AGENT_CONFIG.tonePrompts.formal ?? "";

  const systemSections = [
    CHAT_AGENT_CONFIG.systemPrompt,
    toneDirective,
    "Remember: cap the reply at 3 sentences or 90 words. Skip emoji unless one truly fits.",
    `Current interface language: ${language === "en" ? "English" : "Indonesian"}. Respond using this language.`,
    locationContext
      ? `Visitor is currently browsing ${locationContext}. Take that into account when crafting your answer and navigation hints.`
      : null,
    `Routes you can navigate to:\n${ROUTE_MENU_TEXT}`,
  ].filter(Boolean) as string[];

  const trimmedMessages = messages.slice(-6);

  const toResponseInput = (items: ChatMessage[]) =>
    items.map((message) => ({
      role: message.role,
      content: [
        {
          type: message.role === "assistant" ? ("output_text" as const) : ("input_text" as const),
          text: message.content,
        },
      ],
    }));

  try {
    const responseInput = [
      {
        role: "system",
        content: [{ type: "input_text", text: systemSections.join("\n") }],
      },
      ...toResponseInput(trimmedMessages),
    ];

    const nanoResponse = await client.responses.create({
      model: CHAT_AGENT_CONFIG.model,
      max_output_tokens: CHAT_AGENT_CONFIG.maxOutputTokens,
      input: responseInput as any,
    });

    if (nanoResponse.status !== "completed" || !nanoResponse.output_text?.trim()) {
      throw new Error(`gpt-5-nano incomplete: ${nanoResponse.incomplete_details?.reason ?? "unknown reason"}`);
    }

    const fullText = nanoResponse.output_text.trim();

    const navigateMatch = fullText.match(/\[\[NAVIGATE:([^\]]+)\]\]/i);
    const rawNavigation = navigateMatch ? navigateMatch[1].trim() : null;
    const navigation = await resolveNavigationTarget(rawNavigation, trimmedMessages);
    const cleanedText = fullText.replace(/\[\[NAVIGATE:[^\]]+\]\]/gi, "").trim();
    const trimmedText = clampWords(cleanedText, 100);

    return NextResponse.json({ message: trimmedText, navigation });
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json({ error: "Failed to contact AI agent." }, { status: 500 });
  }
}

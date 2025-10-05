import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the AI concierge for Rifqy Hazim HR's portfolio website.
- "HR" in the brand stands for Haidar Ramadhan (part of his full name), not Human Resources.
- Rifqy Hazim HR is an AI engineer focused on prompt engineering, agent orchestration, and web delivery; reflect that positioning when users ask who he is.
- Answer questions concisely and helpfully in the language specified by the client.
- Suggest relevant sections (About, Works, Projects, Playbooks/Industry, Updates, Contact) based on the user's intent.
- If the user explicitly wants to navigate somewhere, append a directive at the end of your reply using the format [[NAVIGATE:/path]].
- Keep the directive separate from the natural language reply. Only include one directive per reply when appropriate.
- Prefer short paragraphs and bullet lists when useful.
- Sprinkle in fitting emojis (maximum three per reply) to keep the tone energetic and human.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentRequest = {
  messages: ChatMessage[];
  language?: "id" | "en";
  location?: string;
};

interface RouteConfig {
  route: string;
  aliases?: string[];
  keywords: string[];
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
    route: "/updates",
    aliases: ["/news", "/blog"],
    keywords: ["update", "news", "blog", "insight", "posts"],
  },
  {
    route: "/playbooks",
    aliases: ["/industry", "/industries", "/learning", "/learn"],
    keywords: [
      "playbook",
      "playbooks",
      "industry",
      "learning",
      "learn",
      "kelas",
      "education",
      "ai education",
      "academy",
      "study",
      "course",
      "framework",
    ],
  },
  {
    route: "/industry/ai",
    aliases: ["/playbooks/ai", "/playbooks/agi", "/agi", "/ai-playbook", "/ai"],
    keywords: ["agi", "ai", "general intelligence", "artificial intelligence", "ai playbook"],
  },
  {
    route: "/industry/crypto",
    aliases: ["/playbooks/crypto", "/crypto"],
    keywords: ["crypto", "blockchain", "web3", "defi"],
  },
  {
    route: "/industry/biotech",
    aliases: ["/playbooks/biotech", "/biotech"],
    keywords: ["biotech", "biology", "bio", "life science"],
  },
  {
    route: "/industry/energy",
    aliases: ["/playbooks/energy", "/energy"],
    keywords: ["energy", "renewable", "solar", "wind"],
  },
  {
    route: "/industry/space",
    aliases: ["/playbooks/space", "/space"],
    keywords: ["space", "orbital", "satellite", "exploration"],
  },
  {
    route: "/works",
    keywords: ["works", "work", "portfolio", "prompt", "showcase", "deliverables"],
  },
  {
    route: "/projects",
    keywords: ["project", "projects", "web", "app", "build", "case study"],
  },
  {
    route: "/contact",
    keywords: ["contact", "hubungi", "email", "reach", "connect"],
  },
];

const KNOWN_ROUTES = new Set(ROUTE_CONFIG.map((config) => config.route));

const ROUTE_ALIAS_MAP = ROUTE_CONFIG.reduce<Record<string, string>>((acc, config) => {
  for (const alias of config.aliases ?? []) {
    acc[normalizePath(alias) ?? alias] = config.route;
  }
  return acc;
}, {});

function normalizePath(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\/$/, "").toLowerCase() || "/";
  }
  return ("/" + trimmed).replace(/\/$/, "").toLowerCase();
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

function resolveNavigationTarget(raw: string | null, messages: ChatMessage[]): string | null {
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
          const aliasTokens = alias
            .toLowerCase()
            .split("/")
            .filter(Boolean);
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

  const { messages = [], language = "id", location } = payload;

  const locationDescriptions: Record<string, string> = {
    "/": "the home page (hero introduction, quotes, and latest highlights)",
    "/about": "the About page (story, timeline, capabilities, and testimonials)",
    "/playbooks": "the Playbooks hub (AI education and future-industry frameworks)",
    "/updates": "the Updates page (short-form insights and announcements)",
    "/works": "the Works gallery (selected prompt engineering deliverables)",
    "/projects": "the Projects gallery (web/app builds)",
    "/contact": "the Contact page (links, email, and FAQ)",
  };

  const locationContext = location
    ? locationDescriptions[location] ?? `the page at ${location}`
    : undefined;

  const systemSections = [
    SYSTEM_PROMPT,
    `Current interface language: ${language === "en" ? "English" : "Indonesian"}. Respond using this language.`,
    locationContext
      ? `Visitor is currently browsing ${locationContext}. Take that into account when crafting your answer and navigation hints.`
      : null,
  ].filter(Boolean) as string[];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: systemSections.join("\n"),
        },
        ...messages,
      ],
    });

    const fullText = response.choices[0]?.message?.content?.trim() ?? "";
    const navigateMatch = fullText.match(/\[\[NAVIGATE:([^\]]+)\]\]/i);
    const rawNavigation = navigateMatch ? navigateMatch[1].trim() : null;
    const navigation = resolveNavigationTarget(rawNavigation, messages);
    const cleanedText = fullText.replace(/\[\[NAVIGATE:[^\]]+\]\]/gi, "").trim();

    return NextResponse.json({ message: cleanedText, navigation });
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json({ error: "Failed to contact AI agent." }, { status: 500 });
  }
}

"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  VisitorIdentityPrompt,
  type VisitorIdentity,
} from "./VisitorIdentityPrompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentResponse {
  message?: string;
  navigation?: string | null;
  error?: string;
}

const STORAGE_KEY = "rh-agent-chat-session";
const IDENTITY_STORAGE_KEY = "fi-visitor-identity";
const IDENTITY_SESSION_KEY = "fi-visitor-identity-session";

function resolveLanguage(): "id" | "en" {
  if (typeof document === "undefined") {
    return "id";
  }
  const lang = document.documentElement.lang;
  return lang === "en" ? "en" : "id";
}

function resolveTone(): "formal" | "santai" | "deep" {
  if (typeof document === "undefined") {
    return "formal";
  }
  const tone = document.documentElement.dataset.tone;
  if (tone === "santai" || tone === "deep") {
    return tone;
  }
  return "formal";
}

export default function AgentChat() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [tone, setTone] = useState<"formal" | "santai" | "deep">("formal");
  const [allowHover, setAllowHover] = useState(false);
  const [identity, setIdentity] = useState<VisitorIdentity>({
    name: "",
    source: "",
  });
  const [identityReady, setIdentityReady] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [checkingIdentity, setCheckingIdentity] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeout = useRef<number | null>(null);

  const placeholders = useMemo(
    () => ({
      id: "Butuh info tentang Rifqy atau mau lompat ke halaman tertentu?",
      en: "Need a quick pointer about Rifqy or a section jump?",
    }),
    []
  );

  const greeting = useMemo(
    () => ({
      id: {
        formal: "Halo! Aku agent AI Rifqy—sebut saja apa yang kamu butuhkan, aku jawab singkat.",
        santai: "Hai! Agent AI Rifqy siap bantu, tinggal tanya aja ya.",
        deep: "Salam hangat! Aku agent AI Rifqy, siap beri arah dengan cepat.",
      },
      en: {
        formal: "Hello! I'm Rifqy's AI agent—ask what you need and I'll keep it tight.",
        santai: "Hey! I'm Rifqy's AI guide, ready to answer fast.",
        deep: "Greetings! I'm Rifqy's AI agent, here to give focused pointers.",
      },
    }),
    []
  );

  useEffect(() => {
    setLanguage(resolveLanguage());
    setTone(resolveTone());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleToneChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.tone) {
        setTone(detail.tone);
      } else {
        setTone(resolveTone());
      }
    };

    window.addEventListener("tonechange", handleToneChange as EventListener);
    return () => {
      window.removeEventListener("tonechange", handleToneChange as EventListener);
    };
  }, []);

  const storeIdentity = (nextIdentity: VisitorIdentity) => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify(nextIdentity);
    window.localStorage.setItem(IDENTITY_STORAGE_KEY, payload);
    window.sessionStorage.setItem(IDENTITY_SESSION_KEY, payload);
  };

  const clearStoredIdentity = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(IDENTITY_STORAGE_KEY);
    window.sessionStorage.removeItem(IDENTITY_SESSION_KEY);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const resetSession = () => {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore session storage errors
      }
      clearStoredIdentity();
    };

    resetSession();

    window.addEventListener("beforeunload", resetSession);
    window.addEventListener("pagehide", resetSession);

    return () => {
      window.removeEventListener("beforeunload", resetSession);
      window.removeEventListener("pagehide", resetSession);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapIdentity = async () => {
      try {
        const response = await fetch("/api/owner/session", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as
          | { isOwner?: boolean }
          | null;
        if (!cancelled && data?.isOwner) {
          const ownerIdentity: VisitorIdentity = { name: "Owner", source: "internal" };
          setIdentity(ownerIdentity);
          storeIdentity(ownerIdentity);
          setIdentityReady(true);
          setCheckingIdentity(false);
          return;
        }
      } catch {
        // ignore
      }

      if (cancelled) return;

      if (typeof window !== "undefined") {
        const stored =
          window.localStorage.getItem(IDENTITY_STORAGE_KEY) ??
          window.sessionStorage.getItem(IDENTITY_SESSION_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as VisitorIdentity;
            if (parsed?.name && parsed?.source) {
              setIdentity({ name: parsed.name, source: parsed.source });
              setIdentityReady(true);
            }
          } catch {
            clearStoredIdentity();
          }
        }
      }

      setCheckingIdentity(false);
    };

    bootstrapIdentity();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as { messages?: Message[]; open?: boolean };
      if (Array.isArray(stored.messages) && stored.messages.length) {
        setMessages(stored.messages);
      }
      if (typeof stored.open === "boolean") {
        setOpen(stored.open);
      }
    } catch (error) {
      console.warn("Failed to restore agent chat session", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setAllowHover(media.matches);
    update();
    const listener = () => update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
    } else if (typeof media.addListener === "function") {
      media.addListener(listener);
    }
    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", listener);
      } else if (typeof media.removeListener === "function") {
        media.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting[language][tone] }]);
    }
  }, [open, greeting, language, tone, messages.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      messages: messages.slice(-12),
      open,
    };
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist agent chat session", error);
    }
  }, [messages, open]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => () => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  }, []);

  const persistIdentity = (nextIdentity: VisitorIdentity) => {
    setIdentity(nextIdentity);
    storeIdentity(nextIdentity);
  };

  const handleIdentityChange = (nextIdentity: VisitorIdentity) => {
    setIdentity(nextIdentity);
    if (identityError) {
      setIdentityError(null);
    }
  };

  const handleIdentitySubmit = () => {
    const trimmedName = identity.name.trim();
    const trimmedSource = identity.source.trim();

    if (!trimmedName || !trimmedSource) {
      setIdentityError(
        language === "en"
          ? "Please share your name and how you found the site."
          : "Nama dan sumber kunjungan wajib diisi.",
      );
      return;
    }

    persistIdentity({ name: trimmedName, source: trimmedSource });
    setIdentityReady(true);
    setIdentityError(null);
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!identityReady) {
      setIdentityError(
        language === "en"
          ? "Introduce yourself first so I can keep track."
          : "Kenalan dulu yuk—isi nama dan sumbernya.",
      );
      return;
    }

    const newMessage: Message = { role: "user", content: trimmed };
    const history = [...messages, newMessage];

    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          language,
          location: pathname,
          tone,
          identity: identityReady ? identity : undefined,
        }),
      });

      const data = (await response.json()) as AgentResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Agent error");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message ?? "",
      };

      setMessages((current) => [...current, assistantMessage]);

      if (data.navigation) {
        router.push(data.navigation);
      }
    } catch (error) {
      console.error(error);
      const fallback: Message = {
        role: "assistant",
        content:
          language === "en"
            ? "Sorry, the agent is unavailable right now. Please try again later."
            : "Maaf, agent sedang tidak tersedia. Coba lagi sebentar lagi ya.",
      };
      setMessages((current) => [...current, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleMouseEnter = () => {
    if (!allowHover) return;
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!allowHover) return;
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    hoverTimeout.current = window.setTimeout(() => {
      setOpen(false);
    }, 140);
  };

  const resetIdentity = () => {
    clearStoredIdentity();
    setIdentity({ name: "", source: "" });
    setIdentityReady(false);
    setIdentityError(null);
  };

  return (
    <div
      className="agent"
      data-hover={allowHover ? "true" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="agent__launcher pill"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="agentPanel"
      >
        💬 AI Chat
      </button>

      {open && (
        <div id="agentPanel" className="agent__panel card">
          <div className="agent__header">
            <div>
              <div className="agent__title">AI Agent</div>
              <div className="agent__subtitle">
                {language === "en"
                  ? "Ask, learn, or jump to any section."
                  : "Tanya, belajar, atau lompat ke section apa pun."}
              </div>
            </div>
            <button type="button" className="agent__close" onClick={() => setOpen(false)} aria-label="Close agent">
              ×
            </button>
          </div>

          {checkingIdentity ? (
            <div className="agent__messages">
              <div className="agent__message agent__message--assistant">
                <div className="agent__typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          ) : !identityReady ? (
            <div className="agent__identity" style={{ height: "100%" }}>
              <VisitorIdentityPrompt
                language={language}
                identity={identity}
                onChange={handleIdentityChange}
                onSubmit={handleIdentitySubmit}
                error={identityError}
              />
            </div>
          ) : (
            <>
              <div className="agent__identity-chip">
                <span>
                  {language === "en"
                    ? `Chatting as ${identity.name}`
                    : `Mengobrol sebagai ${identity.name}`}
                </span>
                <button type="button" onClick={resetIdentity}>
                  {language === "en" ? "Change" : "Ganti"}
                </button>
              </div>
              <div className="agent__messages">
                {messages.map((message, index) => (
                  <div key={index} className={`agent__message agent__message--${message.role}`}>
                    <div>{message.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="agent__message agent__message--assistant">
                    <div className="agent__typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="agent__composer">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[language]}
                  rows={3}
                />
                <button type="button" className="pill agent__send" onClick={handleSubmit} disabled={loading}>
                  {language === "en" ? "Send" : "Kirim"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

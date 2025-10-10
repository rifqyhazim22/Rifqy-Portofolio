"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentResponse {
  message?: string;
  navigation?: string | null;
  error?: string;
}

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeout = useRef<number | null>(null);

  const placeholders = useMemo(
    () => ({
      id: "Tanya apa saja tentang portofolio, proyek, atau arah belajar…",
      en: "Ask anything about the portfolio, projects, or learning paths…",
    }),
    []
  );

  const greeting = useMemo(
    () => ({
      id: {
        formal: "Halo! Aku agent AI siap bantu kamu jelajahi portofolio Rifqy dengan ringkas.",
        santai: "Hai! Agent AI santai ini siap nganterin kamu keliling portofolio Rifqy.",
        deep: "Salam! Agent AI ini bakal nemenin kamu mendalami portofolio Rifqy dengan hangat.",
      },
      en: {
        formal: "Hello! I'm the AI agent ready to guide you through Rifqy's portfolio succinctly.",
        santai: "Hey! I'm the laid-back AI guide to help you explore Rifqy's portfolio with ease.",
        deep: "Greetings! I'm the reflective AI guide offering meaningful cues through Rifqy's portfolio.",
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
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => () => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  }, []);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessage: Message = { role: "user", content: trimmed };
    const history = [...messages, newMessage];

    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language, location: pathname, tone }),
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
        </div>
      )}
    </div>
  );
}

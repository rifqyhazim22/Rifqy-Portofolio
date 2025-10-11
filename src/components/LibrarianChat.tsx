"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

type Language = "id" | "en";
type Tone = "formal" | "santai" | "deep";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  images?: Array<{
    src: string;
    alt: string;
  }>;
  knowledge?: Array<{
    id: string;
    title: string;
    paths: string[];
  }>;
}

interface ImageDraft {
  name: string;
  mimeType: string;
  preview: string;
  data: string;
  size: number;
}

interface LibrarianChatProps {
  initialLanguage: Language;
}

function resolveLanguage(): Language {
  if (typeof document === "undefined") return "id";
  return document.documentElement.lang === "en" ? "en" : "id";
}

function resolveTone(): Tone {
  if (typeof document === "undefined") return "formal";
  const tone = document.documentElement.dataset.tone;
  if (tone === "santai" || tone === "deep") return tone;
  return "formal";
}

export default function LibrarianChat({ initialLanguage }: LibrarianChatProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [tone, setTone] = useState<Tone>(resolveTone());
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greetings: Record<Language, string> = {
      id: "Halo! Aku penjaga perpustakaan digital Rifqy. Biar aku bantu kamu memahami perjalanan Freedom of Intelligence ini.",
      en: "Hello! I'm Rifqy's digital librarian. Let me guide you through this Freedom of Intelligence journey.",
    };
    return [{ role: "assistant", content: greetings[initialLanguage] }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImageDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const placeholders = useMemo(
    () => ({
      id: "Tanya apa pun tentang Rifqy, proyek, visi Freedom of Intelligence…",
      en: "Ask anything about Rifqy, the portfolio, or the Freedom of Intelligence mission…",
    }),
    [],
  );

  const imageLimit = 3;
  const maxImageSize = 4 * 1024 * 1024;

  useEffect(() => {
    setLanguage(resolveLanguage());
    setTone(resolveTone());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.tone) {
        setTone(detail.tone);
      } else {
        setTone(resolveTone());
      }
    };
    window.addEventListener("tonechange", handler as EventListener);
    return () => window.removeEventListener("tonechange", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;

    const current = pendingImages.length;
    let rejectedMessage: string | null = null;

    Array.from(files)
      .slice(0, imageLimit - current)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) {
          rejectedMessage =
            language === "id"
              ? "Hanya gambar yang bisa diunggah."
              : "Only image files are supported.";
          return;
        }
        if (file.size > maxImageSize) {
          rejectedMessage =
            language === "id"
              ? "Ukuran gambar terlalu besar. Maksimal 4MB."
              : "Image size is too large. Maximum is 4MB.";
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            const base64 = (result.split(",")[1] ?? "").replace(/\s/g, "");
            const draft: ImageDraft = {
              name: file.name,
              mimeType: file.type,
              preview: result,
              data: base64,
              size: file.size,
            };
            setPendingImages((prev) => [...prev, draft]);
          }
        };
        reader.readAsDataURL(file);
      });

    if (rejectedMessage) {
      setError(rejectedMessage);
    } else {
      setError(null);
    }

    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed && pendingImages.length === 0) {
      return;
    }
    if (loading) {
      return;
    }

    setError(null);

    const userContent =
      trimmed ||
      (language === "id"
        ? "Aku mengunggah beberapa gambar supaya kamu bisa bantu jelasin."
        : "Sharing a few images—help me reflect on them.");

    const attachments = [...pendingImages];
    const mediaBlock =
      attachments.length > 0
        ? attachments.map((image) => ({
            src: image.preview,
            alt: image.name,
          }))
        : [];
    const userMessage: ChatMessage = {
      role: "user",
      content: userContent,
      images: mediaBlock,
    };
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");
    setPendingImages([]);
    setLoading(true);

    try {
      const response = await fetch("/api/librarian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          language,
          tone,
          images: attachments.map((image) => ({
            data: image.data,
            mimeType: image.mimeType,
            name: image.name,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message: string; knowledge?: ChatMessage["knowledge"]; error?: string }
        | null;

      if (!response.ok || !data || data.error) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : language === "id"
              ? "Maaf, agent perpustakaan tidak bisa memproses permintaan ini."
              : "Sorry, the library agent cannot process this request.",
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          knowledge: data.knowledge,
        },
      ]);
    } catch (agentError) {
      console.error(agentError);
      const fallbackMessage =
        agentError instanceof Error && agentError.message
          ? agentError.message
          : language === "id"
            ? "Maaf, agent perpustakaan lagi tidak bisa merespons. Coba lagi sebentar lagi ya."
            : "Sorry, the library agent is unavailable right now. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackMessage,
        },
      ]);
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

  return (
    <div className="librarian card">
      <div className="librarian__messages">
        {messages.map((message, index) => (
          <div key={index} className={`librarian__message ${message.role === "user" ? "librarian__message--user" : ""}`}>
            {message.images && message.images.length ? (
              <div className="librarian__bubble-media">
                {message.images.map((image, imageIndex) => (
                  <div key={`${image.alt}-${imageIndex}`} className="librarian__thumb">
                    <img src={image.src} alt={image.alt} />
                  </div>
                ))}
              </div>
            ) : null}
            <div className={`librarian__bubble librarian__bubble--${message.role}`}>
              <div className="librarian__text">{message.content}</div>
              {message.knowledge && message.knowledge.length ? (
                <div className="librarian__knowledge">
                  <span>{language === "id" ? "Referensi:" : "References:"}</span>
                  <ul>
                    {message.knowledge.map((item) => (
                      <li key={item.id}>
                        <strong>{item.title}</strong>{" "}
                        <span>{item.paths.map((path) => `(${path})`).join(" ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="librarian__bubble librarian__bubble--assistant">
            <div className="librarian__typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      {pendingImages.length ? (
        <div className="librarian__attachments">
          {pendingImages.map((image, index) => (
            <div key={image.name + index} className="librarian__attachment">
              <div className="librarian__thumb">
                <img src={image.preview} alt={image.name} />
              </div>
              <button type="button" className="pill librarian__remove" onClick={() => removeImage(index)}>
                {language === "id" ? "Hapus" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <div className="librarian__error">{error}</div> : null}

      <div className="librarian__composer">
        <textarea
          rows={4}
          value={input}
          placeholder={placeholders[language]}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="librarian__actions">
          <label className="pill librarian__upload">
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
            {language === "id" ? "Unggah Gambar" : "Upload Images"}
          </label>
          <button type="button" className="pill librarian__send" onClick={handleSubmit} disabled={loading}>
            {language === "id" ? "Kirim" : "Send"}
          </button>
        </div>
      </div>

    </div>
  );
}

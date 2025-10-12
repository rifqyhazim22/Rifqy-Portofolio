"use client";

import { useMemo, useState, useTransition } from "react";

type ContactFormProps = {
  language: "id" | "en";
};

type FieldErrors = Partial<Record<"name" | "email" | "source" | "message", string>>;

export const ContactForm = ({ language }: ContactFormProps) => {
  const copy = useMemo(
    () =>
      language === "id"
        ? {
            title: "Ingin langsung kontak?",
            description:
              "Tinggalkan informasi singkatmu. Aku akan balas lewat email atau WhatsApp sesuai preferensi yang kamu tulis.",
            nameLabel: "Nama lengkap",
            emailLabel: "Email (opsional)",
            sourceLabel: "Kamu tahu website ini dari mana?",
            messageLabel: "Ceritakan kebutuhanmu",
            sourcePlaceholder: "Instagram, teman, event, Google…",
            messagePlaceholder: "Ceritakan konteks, timeline, atau pertanyaanmu.",
            submit: "Kirim pesan",
            success: "Terima kasih! Pesanmu sudah terekam. Aku akan hubungi secepatnya.",
            error: "Gagal mengirim pesan. Coba lagi sebentar lagi.",
            fieldRequired: "Wajib diisi.",
            emailInvalid: "Format email tidak valid.",
          }
        : {
            title: "Ready to collaborate?",
            description:
              "Share a quick brief—I'll follow up via email or WhatsApp based on your note.",
            nameLabel: "Full name",
            emailLabel: "Email (optional)",
            sourceLabel: "How did you discover this site?",
            messageLabel: "Tell me about your needs",
            sourcePlaceholder: "Instagram, friend, event, Google…",
            messagePlaceholder: "Share context, timeline, or key questions.",
            submit: "Send message",
            success: "Thanks! Your message is logged. I'll get back to you shortly.",
            error: "Unable to send message right now. Please try again later.",
            fieldRequired: "This field is required.",
            emailInvalid: "Please enter a valid email.",
          },
    [language],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) {
      nextErrors.name = copy.fieldRequired;
    }
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      nextErrors.email = copy.emailInvalid;
    }
    if (!source.trim()) {
      nextErrors.source = copy.fieldRequired;
    }
    if (!message.trim()) {
      nextErrors.message = copy.fieldRequired;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim() || undefined,
            source: source.trim(),
            message: message.trim(),
            language,
            page: typeof window !== "undefined" ? window.location.pathname : "/contact",
          }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        setName("");
        setEmail("");
        setSource("");
        setMessage("");
        setErrors({});
        setFeedback(copy.success);
      } catch (error) {
        console.error("Contact submission failed", error);
        setFeedback(copy.error);
      }
    });
  };

  return (
    <section className="card contact__form" data-animate>
      <div className="contact__form-header">
        <h2 className="h2">{copy.title}</h2>
        <p className="sub">{copy.description}</p>
      </div>
      <form className="contact__form-body" onSubmit={handleSubmit} noValidate>
        <label className="contact__form-field">
          <span>{copy.nameLabel}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
            placeholder="Nama kamu"
          />
          {errors.name ? <p className="contact__form-error">{errors.name}</p> : null}
        </label>

        <label className="contact__form-field">
          <span>{copy.emailLabel}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            placeholder="email@domain.com"
          />
          {errors.email ? <p className="contact__form-error">{errors.email}</p> : null}
        </label>

        <label className="contact__form-field">
          <span>{copy.sourceLabel}</span>
          <input
            type="text"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            disabled={isPending}
            placeholder={copy.sourcePlaceholder}
          />
          {errors.source ? <p className="contact__form-error">{errors.source}</p> : null}
        </label>

        <label className="contact__form-field">
          <span>{copy.messageLabel}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            rows={5}
            placeholder={copy.messagePlaceholder}
          />
          {errors.message ? <p className="contact__form-error">{errors.message}</p> : null}
        </label>

        <button
          type="submit"
          className="pill"
          disabled={isPending}
          style={{ alignSelf: "flex-start", opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? `${copy.submit}…` : copy.submit}
        </button>
      </form>
      {feedback ? <p className="contact__form-feedback">{feedback}</p> : null}
    </section>
  );
};

export default ContactForm;

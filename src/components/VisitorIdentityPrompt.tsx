"use client";

export type VisitorIdentity = {
  name: string;
  source: string;
};

type VisitorIdentityPromptProps = {
  language: "id" | "en";
  identity: VisitorIdentity;
  onChange(identity: VisitorIdentity): void;
  onSubmit(): void;
  error?: string | null;
};

export const VisitorIdentityPrompt = ({
  language,
  identity,
  onChange,
  onSubmit,
  error,
}: VisitorIdentityPromptProps) => {
  const copy =
    language === "id"
      ? {
          title: "Sebelum mulai, kenalan dulu yuk?",
          nameLabel: "1. Nama kamu?",
          sourceLabel: "2. Kamu tahu website ini dari mana?",
          cta: "Mulai ngobrol",
        }
      : {
          title: "Quick check-in before we start",
          nameLabel: "1. What's your name?",
          sourceLabel: "2. Where did you discover this site?",
          cta: "Start chatting",
        };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="identity-card"
    >
      <div className="identity-card__header">
        <h2>{copy.title}</h2>
      </div>
      <div className="identity-card__fields">
        <label>
          <span>{copy.nameLabel}</span>
          <input
            value={identity.name}
            onChange={(event) =>
              onChange({ ...identity, name: event.target.value })
            }
            placeholder={language === "id" ? "Nama lengkap atau panggilan" : "Full name or nickname"}
            autoComplete="name"
            required
          />
        </label>
        <label>
          <span>{copy.sourceLabel}</span>
          <input
            value={identity.source}
            onChange={(event) =>
              onChange({ ...identity, source: event.target.value })
            }
            placeholder={
              language === "id"
                ? "Misal: Instagram, teman, event, dsb."
                : "e.g. Instagram, a friend, an event…"
            }
            required
          />
        </label>
      </div>
      {error && (
        <div className="identity-card__error">{error}</div>
      )}
      <button type="submit" className="identity-card__submit">
        {copy.cta}
      </button>
    </form>
  );
};

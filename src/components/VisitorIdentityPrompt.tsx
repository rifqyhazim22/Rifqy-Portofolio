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
          nameLabel: "Nama kamu",
          sourceLabel: "Kamu tahu website ini dari mana?",
          cta: "Mulai ngobrol",
          hint: "Data ini kami simpan agar Rifqy tahu siapa saja yang berkunjung. Tidak akan dibagikan ke pihak lain.",
        }
      : {
          title: "Quick check-in before we start",
          nameLabel: "Your name",
          sourceLabel: "How did you find this site?",
          cta: "Start chatting",
          hint: "We store this so Rifqy knows who is visiting. We will not share it externally.",
        };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center text-white shadow-xl"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white">{copy.title}</h2>
        <p className="mt-2 text-sm text-white/70">{copy.hint}</p>
      </div>
      <div className="w-full space-y-4">
        <label className="block text-left text-sm font-medium text-white/70">
          {copy.nameLabel}
          <input
            value={identity.name}
            onChange={(event) =>
              onChange({ ...identity, name: event.target.value })
            }
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder={language === "id" ? "Nama lengkap atau panggilan" : "Full name or nickname"}
            autoComplete="name"
            required
          />
        </label>
        <label className="block text-left text-sm font-medium text-white/70">
          {copy.sourceLabel}
          <input
            value={identity.source}
            onChange={(event) =>
              onChange({ ...identity, source: event.target.value })
            }
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
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
        <div className="w-full rounded-xl border border-orange-300/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          {error}
        </div>
      )}
      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-80"
      >
        {copy.cta}
      </button>
    </form>
  );
};


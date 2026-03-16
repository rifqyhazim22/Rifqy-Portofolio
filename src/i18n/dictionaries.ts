import { loadHomeContent } from "@/content/home";
import type { HomeContent } from "@/content/home/types";
import type { NavLabelKey } from "@/data/navLinks";
import type { Language } from "@/lib/language";
import type { LinkCard, PillLink } from "@/i18n/types";

export interface Dictionary {
  brand: string;
  navLabels: Record<NavLabelKey, string>;
  languageToggle: {
    label: string;
    options: { id: string; en: string };
  };
  nextStepsHeading: string;
  home: HomeContent;
  about: {
    title: string;
    intro: string;
    philosophyHeading: string;
    philosophyBody: string;
    workHeading: string;
    workItems: LinkCard[];
  };
  works: {
    title: string;
    intro: string;
    buttons: PillLink[];
    gallery: LinkCard[];
  };
}

const homeCache: Record<Language, HomeContent> = {
  id: loadHomeContent("id"),
  en: loadHomeContent("en"),
};

const idDictionary: Dictionary = {
  brand: "Rifqy Hazim HR",
  navLabels: {
    about: "About",
    works: "Works",
    librarian: "AI Agent",
  },
  languageToggle: {
    label: "Bahasa",
    options: { id: "ID", en: "EN" },
  },
  nextStepsHeading: "Jelajah Berikutnya",
  home: homeCache.id,
  about: {
    title: "About",
    intro:
      "Aku mengundangmu masuk ke perpustakaan pribadiku—orkestrasi LLM, agen, sistem prompt, tooling generatif, dan pengalaman web yang kubangun dengan empati dari briefing sampai rilis.",
    philosophyHeading: "Misi & Narasi",
    philosophyBody:
      'Freedom of Intelligence memandu langkahku. "Ad astra abyssosque" menjaga ritme: selami kompleksitas, terbangkan kecerdasan, lalu kembali dengan solusi terdokumentasi yang bisa dirawat siapa saja.',
    workHeading: "Apa yang Aku Bangun",
    workItems: [
      {
        href: "/works",
        title: "AI Systems & Agents",
        sub: "Aku mengorkestrasi multi-agent, memori, evaluasi, dan guardrails biar keputusan tetap tajam dan manusiawi.",
      },
      {
        href: "/works",
        title: "Prompt & Context Systems",
        sub: "Blueprint prompt, knowledge base, dan integrasi tools generatif dengan SOP yang bisa kamu ulang dan ajarkan.",
      },
      {
        href: "/works",
        title: "IT Delivery & Automasi",
        sub: "Next.js, API, otomasi, dan vibe-coded experience supaya produkmu terasa hidup sejak hari pertama.",
      },
    ],
  },
  works: {
    title: "Karya & Proyek",
    intro:
      "Aku memanfaatkan GPT-5 Codex, ChatGPT, dan toolkit prompt + generatif buat membangun agen, otomasi, dan produk imersif. Setiap pengerjaan kurajut dari empati, pemetaan sistem, evaluasi, dan workflow yang menjaga privasi.",
    buttons: [
      {
        href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
        label: "AI Generated Video",
      },
      {
        href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
        label: "AI Generated Image",
      },
      { href: "mailto:rifqyhazim22@gmail.com", label: "Minta sesi walkthrough" },
      { href: "https://wa.me/6281322963566", label: "Diskusi via WhatsApp" },
      { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
    ],
    gallery: [
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "LLM Concierge Lab",
        sub: "Pair-programming dengan GPT-5 Codex untuk navigasi konten, memori, dan evaluasi otomatis.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Pipeline DVC Goldi",
        sub: "Sora → Runway → Flow + SOP produksi untuk 24 detik video generatif.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Campaign AI TSL",
        sub: "Konten video generatif berbasis prompt LLM dengan SOP produksi ringkas.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Bak Kwa Halal Intelligence",
        sub: "LLM research agent menyusun pricing, positioning, dan pitch deck investor.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Generative Asset Lab",
        sub: "Eksperimen Runway dan Veo untuk library video & image siap deploy.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "AI Playbooks",
        sub: "Framework evaluasi prompt, guardrails, dan SOP deployment untuk tim kreator.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Grab Rideshare Intelligence",
        sub: "Ground-truth rideshare data dimodelkan ulang oleh LLM untuk strategi layanan.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Web3 Research Hub",
        sub: "Riset wallet UX, tokenomics, dan smart contract berbasis insight AI.",
      },
    ],
  },
};

const enDictionary: Dictionary = {
  brand: "Rifqy Hazim HR",
  navLabels: {
    about: "About",
    works: "Works",
    librarian: "AI Agent",
  },
  languageToggle: {
    label: "Language",
    options: { id: "ID", en: "EN" },
  },
  nextStepsHeading: "Next Destinations",
  home: homeCache.en,
  about: {
    title: "About",
    intro:
      "I invite you into my personal library—LLM agents, prompt systems, generative tooling, and web experiences crafted with empathy from briefing to launch.",
    philosophyHeading: "Story & Mission",
    philosophyBody:
      'Freedom of Intelligence guides each step. "Ad astra abyssosque" keeps the rhythm: dive deep into complexity, let intelligence travel far, then return with documented solutions anyone can maintain.',
    workHeading: "What I Build",
    workItems: [
      {
        href: "/works",
        title: "AI Systems & Agents",
        sub: "I orchestrate multi-agent systems, memory, evaluation, and guardrails so decisions stay sharp and human.",
      },
      {
        href: "/works",
        title: "Prompt & Context Systems",
        sub: "Prompt blueprints, knowledge bases, and generative tool integrations that stay teachable and repeatable.",
      },
      {
        href: "/works",
        title: "IT Delivery & Automation",
        sub: "IT systems, automation scaffolding, and vibe-coded touchpoints that make products feel alive from day one.",
      },
    ],
  },
  works: {
    title: "Works & Projects",
    intro:
      "I lean on GPT-5 Codex, ChatGPT, and prompt + generative toolchains to build agents, automation, and immersive products. Every delivery is woven from empathy, system mapping, evaluation, and privacy-first workflows.",
    buttons: [
      {
        href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
        label: "AI Generated Video",
      },
      {
        href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
        label: "AI Generated Image",
      },
      { href: "mailto:rifqyhazim22@gmail.com", label: "Request walkthrough" },
      { href: "https://wa.me/6281322963566", label: "Talk on WhatsApp" },
      { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
    ],
    gallery: [
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "LLM Concierge Lab",
        sub: "GPT-5 Codex pairing for navigation, memory, and evaluation harnesses in web interfaces.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Goldi Generative Pipeline",
        sub: "Sora → Runway → Flow SOP delivering 24-second AI video assets.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "TSL AI Campaign",
        sub: "Generative video content shaped by LLM prompt systems and focused production SOPs.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Bak Kwa Halal Intelligence",
        sub: "LLM research agents compiling pricing, positioning, and investor decks.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Generative Asset Lab",
        sub: "Runway and Veo explorations for reusable media libraries.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "AI Playbooks",
        sub: "Prompt evaluation, guardrails, and deployment SOPs for creative teams.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Grab Rideshare Intelligence",
        sub: "Field data modeled with LLMs to shape mobility service strategy.",
      },
      {
        href: "mailto:rifqyhazim22@gmail.com",
        title: "Web3 Research Hub",
        sub: "Wallet UX, tokenomics, and smart-contract studies powered by AI insights.",
      },
    ],
  },
};

const dictionaries: Record<Language, Dictionary> = {
  id: idDictionary,
  en: enDictionary,
};

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}

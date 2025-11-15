import { loadHomeContent } from "@/content/home";
import type { HomeContent } from "@/content/home/types";
import { loadIndustryContent } from "@/content/industry";
import type { IndustryContent } from "@/content/industry/types";
import { loadUpdatesContent } from "@/content/updates";
import type { UpdatesContent } from "@/content/updates/types";
import type { NavLabelKey } from "@/data/navLinks";
import type { Language } from "@/lib/language";
import type {
  IndustryDetail,
  LearningCard,
  LinkCard,
  PillLink,
  UpdateDetail,
  UpdateItem,
} from "@/i18n/types";

export interface Dictionary {
  brand: string;
  navLabels: Record<NavLabelKey, string>;
  languageToggle: {
    label: string;
    options: { id: string; en: string };
  };
  nextStepsHeading: string;
  general: {
    backToUpdates: string;
    dateLabel: string;
    backToIndustry: string;
  };
  home: HomeContent;
  about: {
    title: string;
    intro: string;
    philosophyHeading: string;
    philosophyBody: string;
    workHeading: string;
    workItems: LinkCard[];
    learningHeading: string;
    learningItems: LinkCard[];
  };
  updates: UpdatesContent;
  industry: IndustryContent["overview"];
  industryInteractive: IndustryContent["interactive"];
  industryDetails: IndustryContent["details"];
  learningHub: IndustryContent["learningHub"];
  trainingGames: IndustryContent["trainingGames"];
  works: {
    title: string;
    intro: string;
    buttons: PillLink[];
    gallery: LinkCard[];
  };
  projects: {
    title: string;
    intro: string;
    buttons: PillLink[];
    gallery: LinkCard[];
  };
  contact: {
    title: string;
    intro: string;
    promo?: {
      title: string;
      body: string;
      buttonLabel: string;
      buttonHref: string;
    };
    contacts: LinkCard[];
    downloadsHeading?: string;
    downloads?: LinkCard[];
    downloadsNote?: string;
    faqHeading: string;
    faq: LinkCard[];
  };
}

const homeCache: Record<Language, HomeContent> = {
  id: loadHomeContent("id"),
  en: loadHomeContent("en"),
};

const industryCache: Record<Language, IndustryContent> = {
  id: loadIndustryContent("id"),
  en: loadIndustryContent("en"),
};

const updatesCache: Record<Language, UpdatesContent> = {
  id: loadUpdatesContent("id"),
  en: loadUpdatesContent("en"),
};

const idDictionary: Dictionary = {
    brand: "Rifqy Hazim HR",
    navLabels: {
      about: "About",
      updates: "Updates",
      industry: "Playbooks",
      learning: "Learning Hub",
      works: "Works",
      projects: "Projects",
      librarian: "AI Agent",
      contact: "Contact",
      services: "Layanan",
    },
    languageToggle: {
      label: "Bahasa",
      options: { id: "ID", en: "EN" },
    },
    nextStepsHeading: "Jelajah Berikutnya",
    general: {
      backToUpdates: "← Kembali ke Updates",
      dateLabel: "Tanggal",
      backToIndustry: "← Kembali ke Playbooks",
    },
    home: homeCache.id,
    about: {
      title: "About",
      intro:
        "Aku mengundangmu masuk ke perpustakaan pribadiku—orkestrasi LLM, agen, sistem prompt, tooling generatif, dan pengalaman web yang kubangun dengan empati dari briefing sampai rilis.",
      philosophyHeading: "Misi & Narasi",
      philosophyBody:
        "Freedom of Intelligence memandu langkahku. \"Ad astra abyssosque\" menjaga ritme: selami kompleksitas, terbangkan kecerdasan, lalu kembali dengan solusi terdokumentasi yang bisa dirawat siapa saja.",
      workHeading: "Apa yang Aku Bangun",
      workItems: [
        {
          href: "/works",
          title: "AI Systems & Agents",
          sub: "Aku mengorkestrasi multi-agent, memori, evaluasi, dan guardrails biar keputusan tetap tajam dan manusiawi.",
        },
        {
          href: "/projects",
          title: "Prompt & Context Systems",
          sub: "Blueprint prompt, knowledge base, dan integrasi tools generatif dengan SOP yang bisa kamu ulang dan ajarkan.",
        },
        {
          href: "/industry",
          title: "IT Delivery & Automasi",
          sub: "Next.js, API, otomasi, dan vibe-coded experience supaya produkmu terasa hidup sejak hari pertama.",
        },
      ],
      learningHeading: "Eksplorasi Lanjutan",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Agent", sub: "" },
        { href: "/updates/ai-web", title: "AI + IT Delivery", sub: "" },
        { href: "/industry", title: "Shipping Frameworks", sub: "" },
      ],
    },
    updates: updatesCache.id,
    industry: industryCache.id.overview,
    industryInteractive: industryCache.id.interactive,
    industryDetails: industryCache.id.details,
    learningHub: industryCache.id.learningHub,
    trainingGames: industryCache.id.trainingGames,

    works: {
      title: "Karya",
      intro: "Aku memanfaatkan GPT-5 Codex, ChatGPT, dan toolkit prompt + generatif buat membangun agen, otomasi, dan produk imersif. Setiap pengerjaan kurajut dari empati, pemetaan sistem, evaluasi, dan workflow yang menjaga privasi.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta sesi walkthrough" },
        { href: "https://wa.me/6281322963566", label: "Diskusi via WhatsApp" },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi"
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi"
        },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "LLM Concierge Lab",
          sub: "Pair-programming dengan GPT-5 Codex untuk navigasi konten, memori, dan evaluasi otomatis."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Pipeline DVC Goldi",
          sub: "Sora → Runway → Flow + SOP produksi untuk 24 detik video generatif."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Campaign AI TSL",
          sub: "Konten video generatif berbasis prompt LLM dengan SOP produksi ringkas."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Bak Kwa Halal Intelligence",
          sub: "LLM research agent menyusun pricing, positioning, dan pitch deck investor."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Generative Asset Lab",
          sub: "Eksperimen Runway dan Veo untuk library video & image siap deploy."
        },
      ],
    },
    projects: {
      title: "Projects",
      intro: "Proyek jangka panjang untuk mengorkestrasi agen LLM, memperbesar stack prompt & tooling generatif, dan meneliti peluang Web2/Web3 & crypto. Detail mendalam tersimpan di Google Drive.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta full CV" },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi"
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi"
        },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "AI Playbooks",
          sub: "Framework evaluasi prompt, guardrails, dan SOP deployment untuk tim kreator."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Grab Rideshare Intelligence",
          sub: "Ground-truth rideshare data dimodelkan ulang oleh LLM untuk strategi layanan."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Web3 Research Hub",
          sub: "Riset wallet UX, tokenomics, dan smart contract berbasis insight AI."
        },
      ],
    },
    contact: {
      title: "Contact",
      intro: "Ajak diskusi seputar prompt/context engineering, vibe coding, delivery IT, atau kolaborasi riset.",
      contacts: [
        { href: "mailto:rifqyhazim22@gmail.com", title: "Email", sub: "rifqyhazim22@gmail.com" },
        { href: "https://wa.me/6281322963566", title: "WhatsApp", sub: "081322963566" },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", title: "LinkedIn", sub: "rifqy-hazim-h-r" },
        { href: "https://github.com/rifqyhazim22", title: "GitHub", sub: "rifqyhazim22" },
        { href: "https://instagram.com/rifqy__hazim._", title: "Instagram", sub: "@rifqy__hazim._" },
        { href: "https://www.youtube.com/@RifqyHazimDaily", title: "YouTube", sub: "@RifqyHazimDaily" },
      ],
      downloadsHeading: "Download Dokumen & Artefak",
      downloadsNote: "File docx tersimpan di perpustakaan ini. Kalau kamu butuh format lain atau versi app, tinggal hubungi aku.",
      downloads: [
        {
          href: "/cv-dan-portofolio/CV Rifqy by agent mode.docx",
          title: "Download CV (docx)",
          sub: "CV terbaru yang dirapikan oleh agent—siap kamu baca atau adaptasi."
        },
        {
          href: "/cv-dan-portofolio/Portofolio Rifqy by agent mode.docx",
          title: "Download Portofolio (docx)",
          sub: "Studi kasus, deliverables, dan highlight agen & tooling yang kupimpin."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com?subject=Request%20Access%20to%20Rifqy%20App%20Build",
          title: "Request Download App",
          sub: "Prototype web app sedang disiapkan—kamu bisa minta akses beta lewat email."
        }
      ],
      faqHeading: "FAQ (Cara Aku Bekerja)",
      faq: [
        {
          href: "#privacy",
          title: "Apakah website ini menyimpan data pribadi?",
          sub: "Tidak. Data sensitif tidak disimpan; kontak ditampilkan hanya untuk komunikasi."
        },
        {
          href: "#workflow",
          title: "Bagaimana alur kerja proyek?",
          sub: "Discovery → mapping sistem → prototipe agen/produk → evaluasi → dokumentasi."
        },
        {
          href: "#deliverables",
          title: "Apa output utama yang dikirim?",
          sub: "Agen LLM terukur, blueprint prompt, aplikasi Next.js, serta panduan deploy end-to-end."
        },
      ],
    },
};



const enDictionary: Dictionary = {
    brand: "Rifqy Hazim HR",
    navLabels: {
      about: "About",
      updates: "Updates",
      industry: "Playbooks",
      learning: "Learning Hub",
      works: "Works",
      projects: "Projects",
      librarian: "AI Agent",
      contact: "Contact",
      services: "Services",
    },
    languageToggle: {
      label: "Language",
      options: { id: "ID", en: "EN" },
    },
    nextStepsHeading: "Next Destinations",
    general: {
      backToUpdates: "← Back to Updates",
      dateLabel: "Date",
      backToIndustry: "← Back to Playbooks",
    },
    home: homeCache.en,
    about: {
      title: "About",
      intro:
        "I invite you into my personal library—LLM agents, prompt systems, generative tooling, and web experiences crafted with empathy from briefing to launch.",
      philosophyHeading: "Story & Mission",
      philosophyBody:
        "Freedom of Intelligence guides each step. \"Ad astra abyssosque\" keeps the rhythm: dive deep into complexity, let intelligence travel far, then return with documented solutions anyone can maintain.",
      workHeading: "What I Build",
      workItems: [
        {
          href: "/works",
          title: "AI Systems & Agents",
          sub: "I orchestrate multi-agent systems, memory, evaluation, and guardrails so decisions stay sharp and human.",
        },
        {
          href: "/projects",
          title: "Prompt & Context Systems",
          sub: "Prompt blueprints, knowledge bases, and generative tool integrations that stay teachable and repeatable.",
        },
        {
          href: "/playbooks",
          title: "IT Delivery & Automation",
          sub: "IT systems, automation scaffolding, and vibe-coded touchpoints that make products feel alive from day one.",
        },
      ],
      learningHeading: "Keep Exploring",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Agents", sub: "" },
        { href: "/updates/agent-eval", title: "Agent Evaluation", sub: "" },
        { href: "/learning-hub", title: "Learning Hub", sub: "" },
      ],
    },
    updates: updatesCache.en,
    industry: industryCache.en.overview,
    industryInteractive: industryCache.en.interactive,
    industryDetails: industryCache.en.details,
    learningHub: industryCache.en.learningHub,
    trainingGames: industryCache.en.trainingGames,
    works: {
      title: "Works",
      intro: "I lean on GPT-5 Codex, ChatGPT, and prompt + generative toolchains to build agents, automation, and immersive products. Every delivery is woven from empathy, system mapping, evaluation, and privacy-first workflows.",
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
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi",
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi",
        },
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
      ],
    },
    projects: {
      title: "Projects",
      intro: "Long-horizon blueprints for LLM agents, scaled prompt ops & generative tooling, and Web2/Web3/crypto research. Drive folders store the deep dives.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Video",
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "AI Generated Image",
        },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Request full CV" },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi",
        },
        {
          href: "https://drive.google.com/drive/folders/1f0d3kqVKl4hj16zS-lqzbW3_Dg0O48vs?usp=sharing",
          label: "hasil kolaborasi",
        },
      ],
      gallery: [
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
    contact: {
      title: "Contact",
      intro: "Reach out for prompt/context engineering, vibe coding, IT delivery, or research collaborations.",
      contacts: [
        { href: "mailto:rifqyhazim22@gmail.com", title: "Email", sub: "rifqyhazim22@gmail.com" },
        { href: "https://wa.me/6281322963566", title: "WhatsApp", sub: "+62 813-2296-3566" },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", title: "LinkedIn", sub: "rifqy-hazim-h-r" },
        { href: "https://github.com/rifqyhazim22", title: "GitHub", sub: "rifqyhazim22" },
        { href: "https://instagram.com/rifqy__hazim._", title: "Instagram", sub: "@rifqy__hazim._" },
        { href: "https://www.youtube.com/@RifqyHazimDaily", title: "YouTube", sub: "@RifqyHazimDaily" },
      ],
      downloadsHeading: "Download Docs & Artifacts",
      downloadsNote: "Docs live inside this library. Need another format or the app build? Ping me and I'll prepare it.",
      downloads: [
        {
          href: "/cv-dan-portofolio/CV Rifqy by agent mode.docx",
          title: "Download CV (.docx)",
          sub: "Latest CV curated with the agent—ready for review or remix."
        },
        {
          href: "/cv-dan-portofolio/Portofolio Rifqy by agent mode.docx",
          title: "Download Portfolio (.docx)",
          sub: "Case studies, deliverables, and agent/tooling highlights."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com?subject=Request%20Access%20to%20Rifqy%20App%20Build",
          title: "Request App Download",
          sub: "Web app prototype is in progress—email me to join the beta list."
        }
      ],
      faqHeading: "FAQ (How I Work)",
      faq: [
        {
          href: "#privacy",
          title: "Does this site store personal data?",
          sub: "No. Sensitive data stays off-platform; contact details are shared purely for outreach.",
        },
        {
          href: "#workflow",
          title: "What does the workflow look like?",
          sub: "Discovery → system mapping → agent/product prototype → evaluation → documentation.",
        },
        {
          href: "#deliverables",
          title: "Which deliverables can I expect?",
          sub: "LLM agents with metrics, prompt playbooks, Next.js apps, and end-to-end deployment guides.",
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

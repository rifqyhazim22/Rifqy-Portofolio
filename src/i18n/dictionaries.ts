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
    contacts: LinkCard[];
    faqHeading: string;
    faq: LinkCard[];
  };
}

const dictionaries: Record<Language, Dictionary> = {
  id: {
    brand: "Rifqy Hazim HR",
    navLabels: {
      about: "About",
      updates: "Updates",
      industry: "Playbooks",
      learning: "Learning Hub",
      works: "Works",
      projects: "Projects",
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
    home: loadHomeContent("id"),
    about: {
      title: "About",
      intro:
        "Saya memimpin orkestrasi LLM, agen, dan pipeline generatif untuk menghadirkan produk siap produksi. Semua project dimulai dengan pemetaan sistem, evaluasi otomatis, dan alur kerja yang menjaga privasi.",
      philosophyHeading: "Filosofi & Visi",
      philosophyBody:
        "Ad Astra Abyssosque adalah penuntun: menyelami kompleksitas, kembali dengan solusi kreatif yang terdokumentasi. Bahkan project non-AI saya topang dengan co-pilot LLM, tool generatif, dan otomasi yang saya kuasai.",
      workHeading: "Apa yang Saya Bangun",
      workItems: [
        {
          href: "/works",
          title: "AI Systems & Agents",
          sub: "Multi-agent orchestration, evaluasi, dan guardrails.",
        },
        {
          href: "/projects",
          title: "Generative Pipelines",
          sub: "Video/gambar berbasis Sora, Runway, Veo dengan SOP reproducible.",
        },
        {
          href: "/industry",
          title: "Web Delivery & Automasi",
          sub: "Next.js, API, dan orchestrasi otomasi untuk ship lebih cepat.",
        },
      ],
      learningHeading: "Eksplorasi Lanjutan",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Agent", sub: "" },
        { href: "/updates/ai-web", title: "AI + Web Delivery", sub: "" },
        { href: "/industry", title: "Shipping Frameworks", sub: "" },
      ],
    },
    updates: updatesCache.id,
    industry: industryCache.id.overview,
    industryInteractive: industryCache.id.interactive,
    industryDetails: industryCache.id.details,
    learningHub: industryCache.id.learningHub,

    works: {
      title: "Karya",
      intro: "Saya menggunakan GPT-5 Codex, ChatGPT, dan toolchain generatif untuk membangun agen, otomasi, dan produk imersif. Setiap pengerjaan dimulai dengan pemetaan sistem, evaluasi, dan alur kerja yang menjaga privasi.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta sesi walkthrough" },
        { href: "https://wa.me/6281322963566", label: "Diskusi via WhatsApp" },
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
      intro: "Proyek jangka panjang untuk mengorkestrasi agen LLM, memperbesar pipeline generatif, dan meneliti peluang Web2/Web3 & crypto. Detail mendalam tersimpan di Google Drive.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta full CV" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Entropy Inc",
          sub: "Rancangan ekosistem AI + Web3 dengan tata kelola agen dan utilitas token."
        },
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
      intro: "Ajak diskusi seputar AI engineering, pengembangan web/app, atau kolaborasi riset.",
      contacts: [
        { href: "mailto:rifqyhazim22@gmail.com", title: "Email", sub: "rifqyhazim22@gmail.com" },
        { href: "https://wa.me/6281322963566", title: "WhatsApp", sub: "081322963566" },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", title: "LinkedIn", sub: "rifqy-hazim-h-r" },
        { href: "https://instagram.com/rifqy__hazim._", title: "Instagram", sub: "@rifqy__hazim._" },
      ],
      faqHeading: "FAQ (Cara Saya Bekerja)",
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
          sub: "Agen LLM terukur, aset generatif, aplikasi Next.js, serta panduan deploy end-to-end."
        },
      ],
    },
  },
  en: {
    brand: "Rifqy Hazim HR",
    navLabels: {
      about: "About",
      updates: "Updates",
      industry: "Playbooks",
      learning: "Learning Hub",
      works: "Works",
      projects: "Projects",
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
    home: loadHomeContent("en"),
    about: {
      title: "About",
      intro:
        "I architect LLM agents, generative pipelines, and modern web delivery with GPT-5 Codex, ChatGPT, and automation stacks—every engagement mapped, evaluated, and privacy-aware.",
      philosophyHeading: "Philosophy & Vision",
      philosophyBody:
        "Ad Astra Abyssosque is the compass: dive through complexity, surface with disciplined creativity, document the path. Even outside tech briefs, LLM copilots and generative tooling anchor every decision.",
      workHeading: "What I Ship",
      workItems: [
        {
          href: "/works",
          title: "AI Systems & Agents",
          sub: "Multi-agent orchestration, evaluation, and guardrails.",
        },
        {
          href: "/projects",
          title: "Generative Pipelines",
          sub: "Video/image synthesis, context design, reproducible SOPs.",
        },
        {
          href: "/industry",
          title: "Web Delivery & Automation",
          sub: "Next.js builds, APIs, and automation scaffolding ready to ship.",
        },
      ],
      learningHeading: "Dive Deeper",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Agent", sub: "" },
        { href: "/updates/ai-web", title: "AI + Web Delivery", sub: "" },
        { href: "/industry", title: "Framework Pengiriman", sub: "" },
      ],
    },
    updates: updatesCache.en,
    industry: industryCache.en.overview,
    industryInteractive: industryCache.en.interactive,
    industryDetails: industryCache.en.details,
    learningHub: industryCache.en.learningHub,

      title: "Works",
      intro: "I use GPT-5 Codex, ChatGPT, and generative toolchains to build agents, automation, and immersive products. Every delivery starts with system mapping, evaluation, and privacy-first workflows.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Request walkthrough" },
        { href: "https://wa.me/6281322963566", label: "Talk on WhatsApp" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "LLM Concierge Lab",
          sub: "GPT-5 Codex pairing for navigation, memory, and evaluation harnesses in web interfaces."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Goldi Generative Pipeline",
          sub: "Sora → Runway → Flow SOP delivering 24-second AI video assets."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "TSL AI Campaign",
          sub: "Generative video content shaped by LLM prompt systems and focused production SOPs."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Bak Kwa Halal Intelligence",
          sub: "LLM research agents compiling pricing, positioning, and investor decks."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Generative Asset Lab",
          sub: "Runway and Veo explorations for reusable media libraries."
        },
      ],
    },
    projects: {
      title: "Projects",
      intro: "Long-horizon blueprints for LLM agents, scaled generative operations, and Web2/Web3/crypto research—Drive folders keep the deep dives ready.",
      buttons: [
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Video"
        },
        {
          href: "https://drive.google.com/drive/folders/1uYdeERkYw8nyMBfwkTa2Qn6J8M0UBROO?usp=sharing",
          label: "AI Generated Image"
        },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Request full CV" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Entropy Inc",
          sub: "AI + Web3 ecosystem blueprint with agent governance and token utility models."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "AI Playbooks",
          sub: "Prompt evaluation, guardrails, and deployment SOPs for creative teams."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Grab Rideshare Intelligence",
          sub: "Field data modelled with LLMs to shape mobility service strategy."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Web3 Research Hub",
          sub: "Wallet UX, tokenomics, and smart-contract studies driven by AI insights."
        },
      ],
    },
    contact: {
      title: "Contact",
      intro: "Reach out for AI engineering, web/app development, or research collaborations.",
      contacts: [
        { href: "mailto:rifqyhazim22@gmail.com", title: "Email", sub: "rifqyhazim22@gmail.com" },
        { href: "https://wa.me/6281322963566", title: "WhatsApp", sub: "+62 813-2296-3566" },
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", title: "LinkedIn", sub: "rifqy-hazim-h-r" },
        { href: "https://instagram.com/rifqy__hazim._", title: "Instagram", sub: "@rifqy__hazim._" },
      ],
      faqHeading: "FAQ (How I Work)",
      faq: [
        {
          href: "#privacy",
          title: "Does this site store personal data?",
          sub: "No. Sensitive data stays off-platform; contact details are shared purely for outreach."
        },
        {
          href: "#workflow",
          title: "What does the workflow look like?",
          sub: "Discovery → system mapping → agent/product prototype → evaluation → documentation."
        },
        {
          href: "#deliverables",
          title: "Which deliverables can I expect?",
          sub: "LLM agents with metrics, generative assets, Next.js apps, and end-to-end deployment guides."
        },
      ],
    },
  },
};

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}

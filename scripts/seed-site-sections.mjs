import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const client = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const sections = [
  {
    slug: "home-hero",
    title: "Beranda • Hero",
    body: null,
    metadata: {
      name: "Rifqy Hazim Haidar Ramadhan",
      title: "Prompt & Context Engineer · Vibe Coder · IT Developer",
      tagline: "Prompt & Context Engineer · Vibe Coder · IT Developer",
      summary:
        "Aku adalah prompt & context engineer, vibe coder, dan IT developer yang merancang sistem prompt, agen LLM, dan aplikasi web yang terasa dekat. Setiap kolaborasi dimulai dari empati—mendengar konteksmu, memetakan misi, dan menjaga loop evaluasi yang bikin percaya.",
      availability:
        "Misinya: Freedom of Intelligence—membawa kecerdasan ke seluruh umat manusia dan semesta. Aku siap berkolaborasi untuk engineering konteks LLM, sistem vibe-coded buat brand & produk, serta delivery IT yang benar-benar jalan.",
      actions: [
        { label: "Lihat Studi Kasus AI ↗", href: "/works", variant: "primary" },
        { label: "Eksplor Playbooks AI ↗", href: "/playbooks", variant: "outline" },
        { label: "Tahu Aku Lebih Lanjut ↗", href: "/about" },
      ],
      highlights: [
        { label: "Stack LLM", value: "Codex · ChatGPT · Gemini" },
        { label: "Fokus", value: "Prompt/Context Eng · Vibe Coder · IT Dev" },
        { label: "Plus", value: "Web3 Enthusiast" },
        { label: "Basis", value: "Jabodetabek, Indonesia" },
      ],
      portraitSrc: "/images/hero.jpg",
      backgroundSrc: "/images/hero-background.png",
    },
  },
  {
    slug: "home-quote",
    title: "Quote",
    body: "In the beginning there was dark. Until someone set themselves aflame. Only then did the universe know light.",
    metadata: null,
  },
  {
    slug: "home-journey",
    title: "Narasi Perjalanan",
    body: '"Ad astra abyssosque" selalu jadi kompas: menyelam sedalam mungkin, naik setinggi mungkin, lalu membawa kembali inovasi yang manusiawi.',
    metadata: null,
  },
  {
    slug: "home-what-i-do",
    title: "Apa yang Aku Lakukan sebagai Prompt & Context Engineer · Vibe Coder · IT Developer",
    body: null,
    metadata: {
      items: [
        {
          href: "/works",
          title: "AI Systems & Agents",
          sub: "Aku mengorkestrasi multi-agent, memori, dan evaluasi supaya keputusanmu tetap tajam dan empatik.",
        },
        {
          href: "/projects",
          title: "Prompt & Context Systems",
          sub: "Blueprint prompt, knowledge base, dan integrasi tools generatif untuk workflow yang konsisten.",
        },
        {
          href: "/playbooks",
          title: "IT Delivery & Automasi",
          sub: "Sistem IT, otomasi, dan pengalaman adaptif yang siap tayang.",
        },
      ],
    },
  },
  {
    slug: "home-playbooks",
    title: "Playbooks",
    body:
      "Kerangka kerja praktis yang dikurasi seorang Prompt & Context Engineer · Vibe Coder · IT Developer buat kamu yang mau membawa kecerdasan ke industri: AI→AGI/ASI, Crypto, Bioteknologi, Energi Terbarukan, hingga Space.",
    metadata: {
      items: [
        {
          href: "/industry/ai",
          title: "AI → AGI → ASI",
          sub: "Strategi menggabungkan prompt, agent, dan governance menuju kecerdasan umum.",
        },
        {
          href: "/industry/crypto",
          title: "Crypto",
          sub: "Playbook koordinasi on-chain: token, smart contract, dan mekanisme DeFi.",
        },
        {
          href: "/industry/biotech",
          title: "Biotechnology",
          sub: "Eksperimen bio, food tech, dan biomaterial dengan etika & regulasi terukur.",
        },
        {
          href: "/industry/energy",
          title: "Renewable Energy",
          sub: "Blueprint solusi energi bersih: generasi, penyimpanan, dan smart grid.",
        },
        {
          href: "/industry/space",
          title: "Space",
          sub: "Orbital services, satelit, observasi bumi, dan eksplorasi luar angkasa.",
        },
      ],
    },
  },
  {
    slug: "home-learning",
    title: "Learning Hub",
    body:
      "Butuh jalur belajar? Sebagai Prompt & Context Engineer · Vibe Coder · IT Developer, aku mengkurasi AI Basics, Prompt Patterns, dan Tools & Workflow dengan empati supaya kamu bisa mulai dari kebutuhanmu.",
    metadata: {
      cta: {
        label: "Buka Learning Hub →",
        href: "/learning-hub",
      },
    },
  },
  {
    slug: "home-updates",
    title: "Updates Teranyar dari seorang Prompt & Context Engineer · Vibe Coder · IT Developer",
    body: null,
    metadata: {
      cta: {
        label: "Lihat semua updates →",
        href: "/updates",
      },
    },
  },
  {
    slug: "home-featured",
    title: "Proyek Unggulan",
    body:
      "Proyek jangka panjang untuk mengorkestrasi agen LLM, memperbesar stack prompt & tooling generatif, dan meneliti peluang Web2/Web3 & crypto. Detail mendalam tersimpan di Google Drive.",
    metadata: {
      items: [
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
  },
];

const projects = [
  {
    slug: "ai-playbooks",
    title: "AI Playbooks",
    tagline: "Blueprint agen & guardrails untuk tim kreator",
    description:
      "Framework prompt, evaluasi, dan deployment supaya tim kreator bisa shipping cepat tanpa mengorbankan kualitas.",
    link_url: "mailto:rifqyhazim22@gmail.com",
    hero_image_url: null,
    tags: ["ai", "prompt", "agents"],
    display_order: 1,
    is_featured: true,
    status: "published",
  },
  {
    slug: "grab-rideshare-intelligence",
    title: "Grab Rideshare Intelligence",
    tagline: "LLM memetakan ulang strategi layanan rideshare",
    description:
      "Research agent yang menganalisis data perjalanan, membuat rekomendasi insentif, dan mendokumentasikan SOP operasional.",
    link_url: "mailto:rifqyhazim22@gmail.com",
    hero_image_url: null,
    tags: ["ai", "operations", "mobility"],
    display_order: 2,
    is_featured: true,
    status: "published",
  },
  {
    slug: "web3-research-hub",
    title: "Web3 Research Hub",
    tagline: "Riset wallet UX & tokenomics berbasis insight AI",
    description:
      "Pipeline riset terautomasi untuk menemukan peluang produk Web3, lengkap dengan prompt library & analisis token.",
    link_url: "mailto:rifqyhazim22@gmail.com",
    hero_image_url: null,
    tags: ["web3", "research", "product"],
    display_order: 3,
    is_featured: false,
    status: "published",
  },
];


(async () => {
  try {
    for (const section of sections) {
      const payload = {
        slug: section.slug,
        title: section.title,
        body: section.body,
        metadata: section.metadata,
        status: "published",
      };

      const { error } = await client
        .from("site_sections")
        .upsert(payload, { onConflict: "slug" });

      if (error) {
        throw new Error(`Failed to upsert section ${section.slug}: ${error.message}`);
      }

      console.log(`Upserted section: ${section.slug}`);
    }

    console.log("All site sections seeded.");

    for (const project of projects) {
      const { error } = await client
        .from("projects")
        .upsert(project, { onConflict: "slug" });

      if (error) {
        throw new Error(`Failed to upsert project ${project.slug}: ${error.message}`);
      }

      console.log(`Upserted project: ${project.slug}`);
    }

    console.log("All projects seeded.");
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();

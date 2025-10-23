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
      title: "Prompt & Context Engineer & AI Agent Developer",
      tagline: "Prompt & Context Engineer · Web/App Developer · AI Agent Developer",
      summary:
        "Aku merancang sistem prompt, agen LLM, dan aplikasi web yang terasa dekat. Setiap perjalanan dimulai dengan empati—memahami konteksmu, mendengar misimu, lalu memetakan strategi dan evaluasi yang menjaga kepercayaan.",
      availability:
        "Misinya: Freedom of Intelligence—membawa kecerdasan ke seluruh umat manusia dan semesta. Aku siap berkolaborasi untuk engineering konteks LLM, pengembangan agen, dan delivery web yang berdampak.",
      actions: [
        { label: "Lihat Studi Kasus AI ↗", href: "/works", variant: "primary" },
        { label: "Eksplor Playbooks AI ↗", href: "/playbooks", variant: "outline" },
        { label: "Tahu Aku Lebih Lanjut ↗", href: "/about" },
      ],
      highlights: [
        { label: "Stack LLM", value: "Codex · ChatGPT · Gemini" },
        { label: "Fokus", value: "Prompt/Context Eng · AI Agent Dev · Web/App Dev" },
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
    title: "Apa yang Aku Lakukan",
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
          title: "Web & App Delivery",
          sub: "Aplikasi Next.js, otomasi data, dan pengalaman web adaptif yang siap dibawa ke publik.",
        },
      ],
    },
  },
  {
    slug: "home-playbooks",
    title: "Playbooks",
    body:
      "Kerangka kerja praktis buat kamu yang mau membawa kecerdasan ke industri: AI→AGI/ASI, Crypto, Bioteknologi, Energi Terbarukan, hingga Space.",
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
      "Semua modul belajar—AI Basics, Prompt Patterns, Tools & Workflow—tersusun sebagai kurasi penuh empati. Mulai dengan apa yang kamu butuhkan, lanjutkan dengan guidance yang hidup.",
    metadata: {
      cta: {
        label: "Buka Learning Hub →",
        href: "/learning-hub",
      },
    },
  },
  {
    slug: "home-updates",
    title: "Updates Teranyar",
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

const testimonials = [
  {
    name: "Nadya Pratama",
    role: "Head of Product",
    company: "Creator Collective",
    quote:
      "“Rifqy bantu tim kami membangun agen evaluasi konten. SOP yang dia siapkan bikin editor kami bisa langsung adaptasi.”",
    avatar_url: null,
    display_order: 1,
    status: "published",
  },
  {
    name: "Michael Tan",
    role: "CTO",
    company: "Nova Mobility",
    quote:
      "“Ia mengubah data perjalanan jadi rekomendasi operasional dalam hitungan hari. Dokumentasinya rapi, gampang dioperasikan tim internal.”",
    avatar_url: null,
    display_order: 2,
    status: "published",
  },
  {
    name: "Alya Salsabila",
    role: "Lead Researcher",
    company: "Orbit Labs",
    quote:
      "“Prompt system & guardrails yang ia rancang bikin riset AI kami jauh lebih reliable. Kolaborasi yang penuh empati.”",
    avatar_url: null,
    display_order: 3,
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

    for (const testimonial of testimonials) {
      let query = client.from("testimonials").select("id").eq("name", testimonial.name).limit(1);

      if (testimonial.company) {
        query = query.eq("company", testimonial.company);
      } else {
        query = query.is("company", null);
      }

      const { data: existing, error: fetchError } = await query.maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Failed to fetch testimonial ${testimonial.name}: ${fetchError.message}`);
      }

      let error;
      if (existing?.id) {
        ({ error } = await client
          .from("testimonials")
          .update(testimonial)
          .eq("id", existing.id));
      } else {
        ({ error } = await client.from("testimonials").insert(testimonial));
      }

      if (error) {
        throw new Error(`Failed to upsert testimonial ${testimonial.name}: ${error.message}`);
      }

      console.log(`Upserted testimonial: ${testimonial.name}`);
    }

    console.log("All testimonials seeded.");
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();

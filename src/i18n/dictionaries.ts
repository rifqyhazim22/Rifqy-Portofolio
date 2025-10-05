import { loadHomeContent } from "@/content/home";
import type { HomeContent } from "@/content/home/types";
import type { NavLabelKey } from "@/data/navLinks";
import type { Language } from "@/lib/language";

interface LinkCard {
  href: string;
  title: string;
  sub: string;
}

interface PillLink {
  href: string;
  label: string;
}

export interface UpdateItem {
  href: string;
  title: string;
  summary: string;
}

export interface UpdateDetail {
  title: string;
  date: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  grids?: Array<{ heading: string; items: LinkCard[] }>;
}

export interface IndustryDetail {
  title: string;
  intro: string;
  mindsetHeading: string;
  mindsetBody: string;
  examplesHeading: string;
  examples: LinkCard[];
  actionsHeading: string;
  actions: LinkCard[];
}

interface LearningCard {
  id: string;
  title: string;
  points: Array<{ title: string; body: string }>;
}

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
  updates: {
    title: string;
    intro: string;
    list: UpdateItem[];
    details: Record<string, UpdateDetail>;
  };
  industry: {
    title: string;
    intro: string;
    playbooks: LinkCard[];
    learningHeading: string;
    learningDescription: string;
    learningCards: LearningCard[];
  };
  industryDetails: {
    ai: IndustryDetail;
    crypto: IndustryDetail;
    biotech: IndustryDetail;
    energy: IndustryDetail;
    space: IndustryDetail;
  };
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
        "Saya adalah AI Creative Specialist dan Prompt Engineer yang memadukan produksi konten generatif, strategi penjualan, dan web delivery modern. Fokusnya menghadirkan solusi yang ringkas, terukur, dan aman untuk kolaborasi hari ini.",
      philosophyHeading: "Filosofi & Visi",
      philosophyBody:
        "Ad Astra Abyssosque menjadi kompas untuk menyelami persoalan sampai ke akar sebelum memberi cahaya. Setiap proyek dimulai dengan riset mendalam, definisi nilai, dan protokol privasi yang jelas; lalu dilanjutkan dengan iterasi singkat yang bisa diukur dampaknya.",
      workHeading: "Fokus Utama",
      workItems: [
        {
          href: "/works",
          title: "AI Creative Production",
          sub: "DVC, storytelling, dan orkestrasi generative AI.",
        },
        {
          href: "/projects",
          title: "AI & Web Delivery",
          sub: "Migrasi Next.js, agent workflow, dan dokumentasi deploy.",
        },
        {
          href: "/industry",
          title: "Sales & Strategy Assets",
          sub: "Pitch deck, SOP penjualan, dan analisis pasar terstruktur.",
        },
      ],
      learningHeading: "Eksplorasi Lanjutan",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Context", sub: "" },
        { href: "/updates/ai-web", title: "Creative Ops", sub: "" },
        { href: "/industry", title: "Playbooks & Frameworks", sub: "" },
      ],
    },
    updates: {
      title: "Updates",
      intro: "Kurasi kabar & insight singkat seputar AI, Web, dan 5 industri masa depan.",
      list: [
        {
          href: "/updates/ai-web",
          title: "AI & Web: Kolaborasi Masa Depan",
          summary:
            "Kenapa integrasi AI dan Web penting untuk kreator dan developer modern.",
        },
        {
          href: "/updates/5-industries",
          title: "Lima Industri Masa Depan yang Sedang Memanas",
          summary:
            "AI, Crypto, Biotech, Renewable Energy, Space — ekosistem inovasi yang saling menguatkan.",
        },
        {
          href: "/updates/prompt-engineering",
          title: "Belajar Prompt Engineering dengan Pendekatan Praktis",
          summary:
            "Metode iterasi 3 langkah untuk hasil AI yang stabil dan terukur.",
        },
      ],
      details: {
        "ai-web": {
          title: "AI & Web: Kolaborasi Masa Depan",
          date: "2025-08-09",
          intro:
            "AI semakin matang, dan Web bergerak menuju paradigma baru. Integrasi keduanya bukan lagi wacana—kita sudah melihatnya di banyak sektor: e-commerce memanfaatkan AI untuk personalisasi, aplikasi terdesentralisasi (Web3) mengandalkan AI untuk pengambilan keputusan otonom, dan situs modern memakai AI di belakang layar untuk optimasi konten serta layanan.",
          sections: [
            {
              heading: "Arah Perkembangan",
              body:
                "Web modern akan makin mengandalkan AI untuk memahami konteks pengguna, merangkai konten real-time, dan mengotomasi proses. Di sisi lain, pendekatan terdesentralisasi (Web3) memberi kerangka keterbukaan data & verifiabilitas. Keduanya saling melengkapi: AI memberi kecerdasan; Web memberi jangkauan & dampak.",
            },
          ],
          grids: [
            {
              heading: "Kenapa Penting",
              items: [
                {
                  href: "",
                  title: "AI = “Otak” Sistem Digital",
                  sub: "Menganalisis data, memahami konteks, dan memberi rekomendasi/aksi yang relevan.",
                },
                {
                  href: "",
                  title: "Web = “Dunia” Tempat AI Bekerja",
                  sub: "Antarmuka, distribusi, dan interaksi pengguna—dari browser ke API hingga automations.",
                },
              ],
            },
            {
              heading: "Contoh yang Sudah Terjadi",
              items: [
                {
                  href: "",
                  title: "E-commerce Cerdas",
                  sub: "Chatbot, rekomendasi produk, dan konten dinamis menyesuaikan perilaku pengguna.",
                },
                {
                  href: "",
                  title: "Governance di Aplikasi Terdesentralisasi",
                  sub: "Model AI membantu menganalisis proposal & diskusi komunitas untuk ringkasan netral.",
                },
              ],
            },
          ],
        },
        "5-industries": {
          title: "Lima Industri Masa Depan yang Sedang Memanas",
          date: "2025-08-09",
          intro:
            "Artificial Intelligence, Crypto, Biotechnology, Renewable Energy, dan Space Exploration bukan sekadar wacana masa depan; dampaknya terasa sekarang. AI mempercepat riset & produksi konten; crypto membuka ekonomi digital yang terprogram; biotech mendorong kesehatan & pangan; energi terbarukan menurunkan emisi; dan eksplorasi antariksa menyuplai data penting untuk sektor di Bumi. Kelimanya saling menguatkan—menciptakan ekosistem inovasi yang sulit diabaikan.",
          sections: [
            {
              heading: "Kenapa Relevan Sekarang",
              body:
                "Kurva biaya turun, akses informasi meningkat, dan tools makin mudah dipakai. Artinya: individu & tim kecil bisa bermain di level yang dulu hanya mungkin bagi korporasi besar. Momentum ini adalah kesempatan untuk belajar cepat, bereksperimen, dan membangun portofolio yang nyata.",
            },
          ],
          grids: [
            {
              heading: "Sorotan Singkat",
              items: [
                { href: "", title: "AI", sub: "Otomasi kreatif & analitis; dari tooling kreator sampai asisten riset yang adaptif." },
                { href: "", title: "Crypto", sub: "Aset yang bisa diprogram; tokenisasi & smart contracts memudahkan koordinasi ekonomi." },
                { href: "", title: "Biotech", sub: "Terapi molekuler, pangan presisi, dan material hayati yang ramah lingkungan." },
                { href: "", title: "Renewables", sub: "Surya/angin + baterai & smart grid → biaya turun, pasokan stabil." },
                { href: "", title: "Space", sub: "Data satelit untuk pertanian, logistik, cuaca, dan mitigasi bencana." },
              ],
            },
          ],
        },
        "prompt-engineering": {
          title: "Belajar Prompt Engineering dengan Pendekatan Praktis",
          date: "2025-08-09",
          intro:
            "Prompt engineering adalah seni menyusun instruksi yang jelas, bernuansa, dan terukur untuk AI. Kuncinya bukan sekadar ‘panjang’ atau ‘pendek’, tetapi struktur: tujuan, konteks, batasan, dan gaya. Dengan struktur yang tepat, hasil AI menjadi konsisten dan dapat diandalkan untuk kerja nyata.",
          sections: [
            {
              heading: "Tips Kualitas Output",
              body:
                "Gunakan bahasa yang spesifik, nyatakan batasan sejak awal, dan minta model menjelaskan alasan di balik jawabannya saat perlu transparansi. Simpan prompt yang berhasil sebagai pattern agar produksi berikutnya lebih cepat.",
            },
          ],
          grids: [
            {
              heading: "Metode Ringkas: Iterasi 3 Langkah",
              items: [
                { href: "", title: "1) Draft Awal", sub: "Buat instruksi dasar untuk menguji pemahaman model terhadap tujuan kamu." },
                { href: "", title: "2) Penajaman Detail", sub: "Tambahkan batasan, parameter, dan contoh singkat agar output makin presisi." },
                { href: "", title: "3) Uji Variasi", sub: "Coba sudut pandang & format berbeda; pilih yang paling stabil untuk dijadikan template." },
              ],
            },
          ],
        },
      },
    },
    industry: {
      title: "Playbooks & Edukasi AI",
      intro:
        "Pilih tema untuk membaca ringkasan, dampak potensial, dan cara mulai secara praktis.",
      playbooks: [
        { href: "/industry/ai", title: "AI → AGI → ASI", sub: "Dari sistem spesifik ke kecerdasan umum & melampaui manusia: peluang & etika." },
        { href: "/industry/crypto", title: "Crypto in Finance", sub: "Blockchain, tokenisasi aset, smart contracts, dan model ekonomi baru." },
        { href: "/industry/biotech", title: "Biotechnology", sub: "Rekayasa genetika, terapi molekuler, pangan presisi, material hayati." },
        { href: "/industry/energy", title: "Renewable Energy", sub: "Surya, angin, air, geotermal, biomassa + baterai & smart grid." },
        { href: "/industry/space", title: "Space Exploration", sub: "Satelit, earth observation, eksplorasi planet, dan ekonomi orbit." },
      ],
      learningHeading: "Learning Hub",
      learningDescription:
        "Pengantar singkat yang menyatu—ringkas, edukatif, dan siap dipakai sebagai pijakan awal.",
      learningCards: [
        {
          id: "ai-basics",
          title: "AI Basics",
          points: [
            {
              title: "Gambaran Umum.",
              body:
                "AI Basics adalah pondasi untuk memahami bagaimana mesin belajar dan mengambil keputusan. Fokusnya pada pembedaan AI sempit (narrow AI) dan AI umum (AGI) dengan penjelasan yang mudah diikuti tanpa latar belakang teknis.",
            },
            {
              title: "Penerapan Nyata.",
              body:
                "Rekomendasi konten, asisten suara, hingga filter spam email—contoh sehari-hari bagaimana AI bekerja di belakang layar.",
            },
            {
              title: "Langkah Awal.",
              body:
                "Coba chatbot publik dan baca artikel pengantar seputar model, data, dan algoritma untuk mendapatkan peta konsep dasar.",
            },
          ],
        },
        {
          id: "prompt-patterns",
          title: "Prompt Patterns",
          points: [
            {
              title: "Gambaran Umum.",
              body:
                "Prompt Patterns mengajarkan cara menyusun instruksi efektif. Kualitas output sangat dipengaruhi kejelasan konteks dan detail.",
            },
            {
              title: "Penerapan Nyata.",
              body:
                "Desainer memakai pola deskriptif untuk konsistensi visual; penulis menggunakan pola langkah-demi-langkah agar struktur tetap runtut.",
            },
            {
              title: "Langkah Awal.",
              body:
                "Ambil prompt singkat, tambah detail soal tujuan & batasan, lalu bandingkan hasil untuk memilih versi paling stabil.",
            },
          ],
        },
        {
          id: "tools-workflow",
          title: "Tools & Workflow",
          points: [
            {
              title: "Gambaran Umum.",
              body:
                "Mengenalkan ekosistem alat: generator teks/gambar, editor video berbasis AI, dan integrasi API sesuai kebutuhan.",
            },
            {
              title: "Penerapan Nyata.",
              body:
                "Dari ide → visual mock → skrip → video: setiap tahap memakai tool berbeda namun saling terhubung untuk iterasi cepat.",
            },
            {
              title: "Langkah Awal.",
              body:
                "Pilih satu tool relevan, buat proyek mini dari satu paragraf ide ke output jadi, lalu evaluasi perbaikan iterasi berikutnya.",
            },
          ],
        },
      ],
    },
    industryDetails: {
      ai: {
        title: "🧠 AI → AGI → ASI",
        intro:
          "Dari AI spesifik tugas menuju kecerdasan umum dan potensi melampaui manusia: peluang besar sekaligus tanggung jawab etis.",
        mindsetHeading: "Mindset Shift: Dari AI ke AGI",
        mindsetBody:
          "AI hari ini menguasai tugas sempit (penerjemahan, rekomendasi). AGI menargetkan kemampuan lintas-domain: bisa mentransfer pengetahuan dari satu bidang ke bidang lain dan memecahkan masalah baru. ASI adalah tahap ketika kemampuan ini melampaui manusia—membuka lompatan produktivitas sekaligus isu tata kelola, bias, dan kontrol.",
        examplesHeading: "Contoh Nyata",
        examples: [
          { href: "#multimodal", title: "Asisten Kreatif Multimodal", sub: "Dari brief 1 paragraf: hasilkan skrip video + storyboard + still images." },
          { href: "#research", title: "Agent Riset Ringkas", sub: "Kumpulkan ringkasan 3 sumber tepercaya untuk topik tertentu, beserta kontra-argumen." },
        ],
        actionsHeading: "Langkah Aksi (Minim Effort)",
        actions: [
          { href: "#prompt", title: "Eksperimen Prompt", sub: "Ambil satu ide produk → uji di AI teks & gambar. Catat 3 versi prompt + perbedaan output." },
          { href: "#guardrails", title: "Guardrails Pribadi", sub: "Tentukan 3 batasan etis saat memakai AI dan terapkan konsisten." },
        ],
      },
      crypto: {
        title: "⛓️ Crypto in Finance",
        intro:
          "Keuangan berbasis blockchain: transfer nilai global, tokenisasi aset, dan smart contracts yang bisa diprogram.",
        mindsetHeading: "Mindset Shift: Aset yang Bisa Diprogram",
        mindsetBody:
          "Crypto bukan sekadar ‘uang digital’, melainkan aset yang bisa diprogram. Kepemilikan dan aturan main tercatat di blockchain: transparan, dapat diverifikasi, dan berjalan tanpa perantara.",
        examplesHeading: "Contoh Nyata",
        examples: [
          { href: "#token", title: "Tokenisasi Properti", sub: "Kepemilikan apartemen dipecah menjadi token—membuka akses fractional ownership." },
          { href: "#payment", title: "Pembayaran Global", sub: "Remitansi lintas negara memotong perantara: biaya lebih rendah, settlement lebih cepat." },
        ],
        actionsHeading: "Langkah Aksi (Minim Effort)",
        actions: [
          { href: "#wallet", title: "Coba Wallet Testnet", sub: "Buat wallet di jaringan uji, kirim token faucet untuk memahami flow tanpa risiko." },
          { href: "#contract", title: "Baca Kontrak Sederhana", sub: "Pelajari struktur smart contract dasar untuk memahami hak & batasan pengguna." },
        ],
      },
      biotech: {
        title: "🧬 Biotechnology",
        intro:
          "Biologi + kimia + teknologi untuk kesehatan, pangan, dan material masa depan—didongkrak AI untuk riset lebih cepat.",
        mindsetHeading: "Mindset Shift: Biotech di Kehidupan Sehari-hari",
        mindsetBody:
          "Bioteknologi tidak hanya tentang medis. Dari bio-materials ramah lingkungan sampai pertanian presisi, dampaknya menyentuh rantai pasok pangan hingga limbah industri.",
        examplesHeading: "Contoh Nyata",
        examples: [
          { href: "#protein", title: "Protein/Obat yang Dirancang AI", sub: "Desain molekul lebih cepat → kandidat terapi baru lebih cepat diuji." },
          { href: "#precision", title: "Pertanian Presisi", sub: "Sensor + AI memandu irigasi & pemupukan tepat sasaran." },
        ],
        actionsHeading: "Langkah Aksi (Minim Effort)",
        actions: [
          { href: "#database", title: "Ikuti Satu Database Publik", sub: "Pilih sumber tepercaya dan ringkas 1 inovasi per minggu dengan bahasa awam." },
          { href: "#map", title: "Map Aplikasi Lokal", sub: "Catat 3 potensi penerapan biotech di kota/komunitasmu." },
        ],
      },
      energy: {
        title: "⚡ Renewable Energy",
        intro:
          "Transisi energi bersih: surya, angin, air, geotermal, biomassa—ditopang baterai skala besar dan smart grid.",
        mindsetHeading: "Mindset Shift: Investasi Jangka Panjang",
        mindsetBody:
          "Energi terbarukan bukan hanya soal ‘lebih hijau’. Ini strategi biaya jangka panjang, resiliensi pasokan, dan peluang bisnis dari instalasi hingga pemeliharaan.",
        examplesHeading: "Contoh Nyata",
        examples: [
          { href: "#solar", title: "Atap Surya Rumah Tangga", sub: "Produksi listrik lokal; kadang surplus bisa disalurkan ke grid." },
          { href: "#battery", title: "Baterai + Smart Meter", sub: "Simpan energi di jam murah, pakai di jam mahal—optimasi biaya." },
        ],
        actionsHeading: "Langkah Aksi (Minim Effort)",
        actions: [
          { href: "#audit", title: "Audit Kecil Konsumsi", sub: "Ambil kWh 1 bulan, identifikasi 3 peralatan paling boros." },
          { href: "#calculator", title: "Kalkulator Potensi Surya", sub: "Perkirakan output atap berdasarkan luas & iradiasi kota." },
        ],
      },
      space: {
        title: "🚀 Space Exploration",
        intro:
          "Dari misi pemerintah ke ekonomi komersial: satelit, Earth Observation, eksplorasi planet, dan pasar layanan data orbit.",
        mindsetHeading: "Mindset Shift: Data Antariksa untuk Bumi",
        mindsetBody:
          "Eksplorasi ruang angkasa menghasilkan data observasi bumi yang kritikal untuk pertanian, logistik, mitigasi bencana, hingga tata kelola lingkungan—bukan hanya ‘pergi ke Mars’.",
        examplesHeading: "Contoh Nyata",
        examples: [
          { href: "#soil", title: "Pemetaan Kelembaban Tanah", sub: "Citra satelit membantu petani mengidentifikasi area kekeringan." },
          { href: "#fires", title: "Monitoring Kebakaran Hutan", sub: "Heat signatures dan asap terdeteksi dini untuk respons cepat." },
        ],
        actionsHeading: "Langkah Aksi (Minim Effort)",
        actions: [
          { href: "#maps", title: "Jelajah Peta Satelit Publik", sub: "Coba platform data satelit terbuka untuk melihat cuaca/awan real-time." },
          { href: "#usecase", title: "Idekan 1 Use-Case Lokal", sub: "Tulis 1 paragraf bagaimana data satelit bisa bantu isu di kotamu." },
        ],
      },
    },
    works: {
      title: "Karya",
      intro: "Koleksi proyek generatif, strategi, dan eksperimen AI. Demo lengkap tersedia lewat email atau WhatsApp.",
      buttons: [
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta demo via email" },
        { href: "https://wa.me/6281322963566", label: "WhatsApp untuk diskusi" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Redesain Landing Page TSL",
          sub: "SPA interaktif dengan router, toggle tema, bahasa ganda, dan backend Node.js."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Migrasi Portofolio ke Next.js",
          sub: "Sistem konten bilingual, UI adaptif, dan agent AI untuk navigasi."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Digital Video Commercial AI",
          sub: "DVC 24 detik Goldi Skincare dengan pipeline Sora -> Runway -> Flow."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Influencer Marketing AI - TSL x Gema",
          sub: "Iklan 56 detik dengan konsistensi karakter dan produksi cepat."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Riset & Strategi Bak Kwa Halal",
          sub: "Analisis pasar, pricing, dan pitch deck untuk produk kuliner inovatif."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Web Portofolio AI Interaktif",
          sub: "Situs pribadi modern dengan integrasi API AI dan modul bilingual."
        },
      ],
    },
    projects: {
      title: "Projects",
      intro: "Inisiatif jangka panjang yang menggabungkan AI, strategi penjualan, dan riset pasar.",
      buttons: [
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Minta CV lengkap" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Entropy Inc Initiative",
          sub: "Blueprint ekosistem AI, Web3, dan otomasi digital jangka panjang."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Sales Enablement Playbook",
          sub: "Toolkit value creation untuk otomotif dan B2B."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Transportasi Masa Depan",
          sub: "Riset pola permintaan ride hailing sebagai dasar mobilitas udara."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Learning Modules",
          sub: "Playbooks prompt, agent, dan governance untuk tim kreator."
        },
      ],
    },
    contact: {
      title: "Contact",
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
          sub: "Discovery -> definisi nilai -> prototipe -> validasi -> dokumentasi."
        },
        {
          href: "#deliverables",
          title: "Apa output utama yang dikirim?",
          sub: "Pipeline AI, SOP, pitch deck, landing page, dan aset kreatif siap pakai."
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
        "I am an AI Creative Specialist and Prompt Engineer who blends generative production, sales enablement, and modern web delivery into measurable outcomes.",
      philosophyHeading: "Philosophy & Vision",
      philosophyBody:
        "Ad Astra Abyssosque is the compass—dive into complex systems and surface with disciplined creativity. Every project starts with research, aligned value, and explicit privacy protocols; then we iterate quickly and track the impact.",
      workHeading: "Core Focus",
      workItems: [
        {
          href: "/works",
          title: "AI Creative Production",
          sub: "AI-first DVC pipelines, storytelling, and creative direction.",
        },
        {
          href: "/projects",
          title: "AI & Web Delivery",
          sub: "Next.js migrations, agent orchestration, and deploy-ready documentation.",
        },
        {
          href: "/industry",
          title: "Sales & Strategy Assets",
          sub: "Pitch decks, SOPs, and structured market analysis.",
        },
      ],
      learningHeading: "Further Reading",
      learningItems: [
        { href: "/updates/prompt-engineering", title: "Prompt & Context", sub: "" },
        { href: "/updates/ai-web", title: "Creative Ops", sub: "" },
        { href: "/industry", title: "Playbooks & Frameworks", sub: "" },
      ],
    },
    updates: {
      title: "Updates",
      intro: "Short-form insight curation across AI, the modern web, and five future industries.",
      list: [
        {
          href: "/updates/ai-web",
          title: "AI & Web: The Collaboration Ahead",
          summary:
            "Why merging AI and web stacks matters for modern creators and developers.",
        },
        {
          href: "/updates/5-industries",
          title: "Five Industries Heating Up",
          summary:
            "AI, Crypto, Biotech, Renewables, Space—an innovation flywheel you can't ignore.",
        },
        {
          href: "/updates/prompt-engineering",
          title: "Learn Prompt Engineering the Practical Way",
          summary:
            "A three-step iteration method for dependable AI results.",
        },
      ],
      details: {
        "ai-web": {
          title: "AI & Web: The Collaboration Ahead",
          date: "2025-08-09",
          intro:
            "AI capabilities are compounding while the web shifts into new paradigms. Their integration is already here: e-commerce teams use AI for personalization, decentralized apps rely on AI to summarize governance debates, and modern sites plug AI in the background for content optimization and service delivery.",
          sections: [
            {
              heading: "Where It's Going",
              body:
                "Expect more context-aware web experiences that stitch AI decisioning with open, verifiable data flows. AI delivers intelligence; the web delivers reach and impact.",
            },
          ],
          grids: [
            {
              heading: "Why It Matters",
              items: [
                {
                  href: "",
                  title: "AI as the Decision Layer",
                  sub: "Analyzes data, interprets context, and recommends relevant actions.",
                },
                {
                  href: "",
                  title: "Web as the Delivery Layer",
                  sub: "Provides interfaces, distribution, and integrations across browsers, APIs, and automations.",
                },
              ],
            },
            {
              heading: "Examples in the Wild",
              items: [
                {
                  href: "",
                  title: "Adaptive Commerce",
                  sub: "Chatbots, recommendations, and dynamic content in sync with user behavior.",
                },
                {
                  href: "",
                  title: "DAO Governance",
                  sub: "AI condenses proposals and debates into neutral summaries for faster decisions.",
                },
              ],
            },
          ],
        },
        "5-industries": {
          title: "Five Industries Heating Up",
          date: "2025-08-09",
          intro:
            "Artificial Intelligence, Crypto, Biotechnology, Renewable Energy, and Space Exploration are no longer distant bets. AI accelerates research and content; crypto opens programmable economies; biotech advances health and food systems; renewables cut emissions; and space tech supplies earth intelligence. Together they reinforce each other, creating an innovation ecosystem you can't overlook.",
          sections: [
            {
              heading: "Why Now",
              body:
                "Falling costs, abundant information, and easier tooling mean individuals and small teams can compete with legacy players. It's the right moment to learn quickly, experiment often, and build tangible portfolios.",
            },
          ],
          grids: [
            {
              heading: "Quick Highlights",
              items: [
                { href: "", title: "AI", sub: "Creative and analytical automation—from tooling for creators to adaptive research aides." },
                { href: "", title: "Crypto", sub: "Programmable value flows, tokenized assets, and smart-contract coordination." },
                { href: "", title: "Biotech", sub: "Precision therapies, food innovation, and sustainable biomaterials." },
                { href: "", title: "Renewables", sub: "Generation plus storage and smart grids that stabilize supply." },
                { href: "", title: "Space", sub: "Earth intelligence for agriculture, logistics, climate, and disaster mitigation." },
              ],
            },
          ],
        },
        "prompt-engineering": {
          title: "Learn Prompt Engineering the Practical Way",
          date: "2025-08-09",
          intro:
            "Prompt engineering is the craft of writing precise, nuanced, and testable instructions for AI systems. Structure beats length: articulate goals, context, constraints, and tone. The payoff is consistent, production-grade outputs.",
          sections: [
            {
              heading: "Quality Tips",
              body:
                "Use specific language, declare boundaries upfront, and request reasoning when transparency matters. Save the best-performing prompts as reusable patterns.",
            },
          ],
          grids: [
            {
              heading: "Three-Step Iteration",
              items: [
                { href: "", title: "1) Draft", sub: "Ship a quick prompt to gauge model understanding." },
                { href: "", title: "2) Refine", sub: "Add constraints, parameters, and micro examples for precision." },
                { href: "", title: "3) Test Variations", sub: "Change perspective or format, keep the most stable output as your template." },
              ],
            },
          ],
        },
      },
    },
    industry: {
      title: "Playbooks & AI Education",
      intro: "Pick a theme to explore the summary, potential impact, and practical starting points.",
      playbooks: [
        { href: "/industry/ai", title: "AI → AGI → ASI", sub: "From narrow systems to general and super intelligence: opportunities and ethics." },
        { href: "/industry/crypto", title: "Crypto in Finance", sub: "Blockchain, asset tokenization, smart contracts, and new economic models." },
        { href: "/industry/biotech", title: "Biotechnology", sub: "Genetic engineering, molecular therapy, precision food, biomaterials." },
        { href: "/industry/energy", title: "Renewable Energy", sub: "Solar, wind, hydro, geothermal, biomass—plus batteries and smart grids." },
        { href: "/industry/space", title: "Space Exploration", sub: "Satellites, earth observation, planetary exploration, orbital services." },
      ],
      learningHeading: "Learning Hub",
      learningDescription:
        "Short, connected primers—concise, educational, and ready to act on immediately.",
      learningCards: [
        {
          id: "ai-basics",
          title: "AI Basics",
          points: [
            {
              title: "Overview.",
              body:
                "Foundational concepts outlining how models learn and make decisions—clarifying the difference between narrow AI and broader AGI ambitions.",
            },
            {
              title: "Real-world Use.",
              body:
                "Recommendation systems, voice assistants, and spam filters illustrate how AI already supports daily life behind the scenes.",
            },
            {
              title: "First Steps.",
              body:
                "Experiment with public chatbots and read concise explainers on models, data, and algorithms to build your mental map.",
            },
          ],
        },
        {
          id: "prompt-patterns",
          title: "Prompt Patterns",
          points: [
            {
              title: "Overview.",
              body:
                "Prompt patterns teach you to structure instructions effectively. Specific context and detail drive consistent outputs.",
            },
            {
              title: "Real-world Use.",
              body:
                "Designers lean on descriptive patterns for visual consistency; writers rely on step-by-step prompts for organized drafts.",
            },
            {
              title: "First Steps.",
              body:
                "Start with a short prompt, add goals and constraints, compare outputs, and lock the version that stays reliable.",
            },
          ],
        },
        {
          id: "tools-workflow",
          title: "Tools & Workflow",
          points: [
            {
              title: "Overview.",
              body:
                "Map the AI tool stack: text/image generators, AI-assisted video editors, and API integrations—all selected by objective.",
            },
            {
              title: "Real-world Use.",
              body:
                "Idea → visual mock → script → video: each stage relies on a different tool but connects into one iterative pipeline.",
            },
            {
              title: "First Steps.",
              body:
                "Pick one relevant tool, ship a mini project from concept to output, then note what to tweak next iteration.",
            },
          ],
        },
      ],
    },
    industryDetails: {
      ai: {
        title: "🧠 AI → AGI → ASI",
        intro:
          "From task-specific systems toward general intelligence and beyond—huge upside paired with governance duties.",
        mindsetHeading: "Mindset Shift: From AI to AGI",
        mindsetBody:
          "Today’s AI excels at narrow tasks. AGI aims for cross-domain skills, transferring knowledge and solving novel problems. ASI surpasses human capability, offering leaps in productivity while raising questions around control, bias, and safety.",
        examplesHeading: "Example Use Cases",
        examples: [
          { href: "#multimodal", title: "Multimodal Creative Assistant", sub: "One brief → script, storyboard, and still images for a moodboard." },
          { href: "#research", title: "Concise Research Agent", sub: "Summaries from three trusted sources plus opposing viewpoints." },
        ],
        actionsHeading: "Quick Actions",
        actions: [
          { href: "#prompt", title: "Prompt Experiments", sub: "Take one product idea, test it in text & image models, document three prompt variations." },
          { href: "#guardrails", title: "Personal Guardrails", sub: "Define three ethical boundaries (privacy, attribution, sensitive data) and enforce them." },
        ],
      },
      crypto: {
        title: "⛓️ Crypto in Finance",
        intro:
          "Programmable finance built on blockchain: global value transfer, asset tokenization, and smart contracts.",
        mindsetHeading: "Mindset Shift: Programmable Assets",
        mindsetBody:
          "Crypto isn’t just ‘digital money’—it’s programmable ownership. Rules are transparent, verifiable, and enforced automatically on-chain.",
        examplesHeading: "Example Use Cases",
        examples: [
          { href: "#token", title: "Property Tokenization", sub: "Fractional ownership of real estate unlocks liquidity and access." },
          { href: "#payment", title: "Global Payments", sub: "Cross-border remittance with fewer intermediaries, lower fees, faster settlements." },
        ],
        actionsHeading: "Quick Actions",
        actions: [
          { href: "#wallet", title: "Try a Testnet Wallet", sub: "Create a wallet, move faucet tokens, and learn flows without capital risk." },
          { href: "#contract", title: "Read a Simple Contract", sub: "Study mint/transfer functions to understand user rights and limits." },
        ],
      },
      biotech: {
        title: "🧬 Biotechnology",
        intro:
          "Biology, chemistry, and technology for next-gen health, food, and materials—accelerated by AI-led research.",
        mindsetHeading: "Mindset Shift: Everyday Biotech",
        mindsetBody:
          "Biotech stretches beyond medicine. From sustainable biomaterials to precision agriculture, it touches supply chains, waste, and wellness.",
        examplesHeading: "Example Use Cases",
        examples: [
          { href: "#protein", title: "AI-Designed Proteins/Drugs", sub: "Faster molecular design leading to quicker lab trials." },
          { href: "#precision", title: "Precision Agriculture", sub: "Sensors plus AI guide irrigation and nutrients with minimal waste." },
        ],
        actionsHeading: "Quick Actions",
        actions: [
          { href: "#database", title: "Follow a Public Database", sub: "Pick a trusted source and summarize one innovation per week in plain language." },
          { href: "#map", title: "Map Local Applications", sub: "List three biotech opportunities for your city/community (food, waste, preventative health)." },
        ],
      },
      energy: {
        title: "⚡ Renewable Energy",
        intro:
          "Clean energy transition: solar, wind, hydro, geothermal, biomass—backed by large-scale batteries and smart grids.",
        mindsetHeading: "Mindset Shift: Long-Term Investment",
        mindsetBody:
          "Renewables aren’t just greener; they’re strategic for cost, resilience, and new business opportunities from deployment to maintenance.",
        examplesHeading: "Example Use Cases",
        examples: [
          { href: "#solar", title: "Residential Solar", sub: "Produce local power and, when allowed, sell surplus back to the grid." },
          { href: "#battery", title: "Battery + Smart Meter", sub: "Store energy off-peak, use it during peak hours to cut bills and ease the grid." },
        ],
        actionsHeading: "Quick Actions",
        actions: [
          { href: "#audit", title: "Mini Consumption Audit", sub: "Review a month’s kWh usage, flag the three hungriest devices." },
          { href: "#calculator", title: "Solar Potential Calculator", sub: "Estimate rooftop output from area and local irradiation—get a rough payback." },
        ],
      },
      space: {
        title: "🚀 Space Exploration",
        intro:
          "From state missions to commercial space economy: satellites, earth observation, planetary ventures, orbital services.",
        mindsetHeading: "Mindset Shift: Space Data for Earth",
        mindsetBody:
          "Space exploration yields earth observation data essential for agriculture, logistics, disaster mitigation, and environmental governance—not just ‘going to Mars’.",
        examplesHeading: "Example Use Cases",
        examples: [
          { href: "#soil", title: "Soil Moisture Mapping", sub: "Satellite imagery helps farmers detect drought zones and plan irrigation." },
          { href: "#fires", title: "Wildfire Monitoring", sub: "Thermal signatures and smoke detection enable faster response and lower loss." },
        ],
        actionsHeading: "Quick Actions",
        actions: [
          { href: "#maps", title: "Explore Open Satellite Maps", sub: "Use public data portals to inspect weather/coverage in real time." },
          { href: "#usecase", title: "Draft a Local Use Case", sub: "Outline how satellite data could support a local issue (floods, congestion, agriculture)." },
        ],
      },
    },
    works: {
      title: "Works",
      intro: "A collection of generative projects, strategic experiments, and AI showcases. Full demos available on request.",
      buttons: [
        { href: "mailto:rifqyhazim22@gmail.com", label: "Request demo via email" },
        { href: "https://wa.me/6281322963566", label: "Discuss on WhatsApp" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "TSL Landing Page Redesign",
          sub: "Interactive SPA with router, theme toggle, EN/ID UX, and Node.js backend."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Next.js Portfolio Migration",
          sub: "Bilingual content system, adaptive UI, and AI concierge navigation."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "AI Digital Video Commercial",
          sub: "24-second Goldi Skincare DVC powered by the Sora → Runway → Flow pipeline."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Influencer Marketing AI — TSL × Gema",
          sub: "56-second campaign with consistent characters and accelerated production."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Bak Kwa Halal Research & Strategy",
          sub: "Market analysis, pricing strategy, and investor-facing pitch deck."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Interactive AI Portfolio Site",
          sub: "Modern personal site with AI integrations and bilingual modules."
        },
      ],
    },
    projects: {
      title: "Projects",
      intro: "Long-term initiatives bridging AI, sales strategy, and market intelligence.",
      buttons: [
        { href: "https://www.linkedin.com/in/rifqy-hazim-h-r-88963128a/", label: "LinkedIn" },
        { href: "mailto:rifqyhazim22@gmail.com", label: "Request full CV" },
      ],
      gallery: [
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Entropy Inc Initiative",
          sub: "Blueprint for an innovation ecosystem combining AI, Web3, and automation."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Sales Enablement Playbook",
          sub: "Value-creation toolkit for automotive and B2B engagements."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Future Mobility Research",
          sub: "Ride-hailing demand mapping that informs aerial transport concepts."
        },
        {
          href: "mailto:rifqyhazim22@gmail.com",
          title: "Learning Modules",
          sub: "Prompt, agent, and governance playbooks for creative teams."
        },
      ],
    },
    contact: {
      title: "Contact",
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
          sub: "Discovery → value definition → prototype → validation → documentation."
        },
        {
          href: "#deliverables",
          title: "Which deliverables can I expect?",
          sub: "AI pipelines, SOPs, pitch decks, landing pages, and production-ready creative assets."
        },
      ],
    },
  },
};

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}

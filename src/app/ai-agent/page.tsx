import LibrarianChat from "@/components/LibrarianChat";
import { getCurrentLanguage } from "@/lib/language";

export default async function AiAgentPage() {
  const language = await getCurrentLanguage();

  const content =
    language === "id"
      ? {
          title: "AI Agent",
          subtitle: "Sapa agent yang mengenal CV, portofolio, dan setiap narasi Freedom of Intelligence.",
          description:
            "Agent ini fleksibel—bisa kamu ajak diskusi tentang perjalanan Rifqy, strategi AI, hingga cara membawa kecerdasan ke komunitasmu. Kalau butuh rujukan, dia akan menyebutkan path halaman atau dokumen yang relevan.",
          notes: [
            "Gunakan kata kunci spesifik kalau ingin menggali proyek atau pengalaman tertentu.",
            "Kamu bisa unggah gambar untuk dianalisis bersama—misalnya moodboard, hasil karya, atau ide yang sedang kamu garap.",
            "Jika informasinya belum tersedia, agent akan jujur dan menawarkan cara menindaklanjuti.",
          ],
        }
      : {
          title: "AI Agent",
          subtitle: "Meet the agent who knows the CV, portfolio, and every Freedom of Intelligence narrative.",
          description:
            "This agent is flexible—talk about Rifqy's journey, AI strategies, or how to bring intelligence into your community. When relevant, it references the exact page paths or documents.",
          notes: [
            "Use specific keywords if you want to dive into a project or experience.",
            "Upload images to explore them together—moodboards, results, or ideas you're shaping.",
            "If the knowledge is missing, the agent will say so and suggest next steps.",
          ],
        };

  return (
    <div className="page ai-agent">
      <section className="ai-agent__intro" data-animate>
        <header>
          <h1 className="h1">{content.title}</h1>
          <p className="sub">{content.subtitle}</p>
        </header>
        <p>{content.description}</p>
        <ul className="ai-agent__notes">
          {content.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
      <section className="ai-agent__chat" data-animate>
        <LibrarianChat initialLanguage={language} />
      </section>
    </div>
  );
}

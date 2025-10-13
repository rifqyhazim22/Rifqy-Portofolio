import { Suspense } from "react";
import {
  AgentLogPanel,
  type AgentLogRecord,
} from "./_components/AgentLogPanel";
import {
  EditableSectionCard,
  type SiteSection,
} from "./_components/EditableSectionCard";
import {
  ProjectList,
  type ProjectRecord,
} from "./_components/ProjectList";
import {
  TestimonialList,
  type TestimonialRecord,
} from "./_components/TestimonialList";
import { createSupabaseServiceClient } from "@/lib/supabase";

const fetchOwnerDashboardData = async () => {
  const supabase = createSupabaseServiceClient();

  const [{ data: sections = [] }, { data: projects = [] }, { data: testimonials = [] }, { data: agentLogs = [] }] =
    await Promise.all([
      supabase.from("site_sections").select("*").order("slug", { ascending: true }),
      supabase.from("projects").select("*").order("display_order", { ascending: true }),
      supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("agent_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return {
    sections: sections as SiteSection[],
    projects: projects as ProjectRecord[],
    testimonials: testimonials as TestimonialRecord[],
    agentLogs: agentLogs as AgentLogRecord[],
  };
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
      <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
    </div>
  </div>
);

export default async function OwnerDashboardPage() {
  const { sections, projects, testimonials, agentLogs } =
    await fetchOwnerDashboardData();

  const publishedProjects = projects.filter((item) => item.status === "published");
  const publishedTestimonials = testimonials.filter((item) => item.status === "published");

  const uniqueVisitorCount = new Set(
    agentLogs.map((log) =>
      [
        log.visitor_name?.toLowerCase().trim() ?? "",
        log.visitor_email?.toLowerCase().trim() ?? "",
        log.referrer?.toLowerCase().trim() ?? "",
      ].join("|"),
    ),
  ).size;

  return (
    <div className="owner-dashboard">
      <section className="owner-dashboard__hero" data-animate>
        <div>
          <p className="owner-dashboard__eyebrow">Rifqy Hazim HR • Owner tools</p>
          <h1>Command Center</h1>
          <p>
            Update narasi, kurasi studi kasus, dan pantau percakapan agent tanpa harus
            turun ke kode. Semua perubahan langsung tercatat di Supabase.
          </p>
        </div>
        <div className="owner-dashboard__stats">
          <article>
            <span>Sections managed</span>
            <strong>{sections.length}</strong>
          </article>
          <article>
            <span>Live projects</span>
            <strong>{publishedProjects.length}</strong>
          </article>
          <article>
            <span>Testimonials</span>
            <strong>{publishedTestimonials.length}</strong>
          </article>
          <article>
            <span>Visitor intros (30d)</span>
            <strong>{uniqueVisitorCount}</strong>
          </article>
        </div>
      </section>

      <div className="owner-dashboard__columns">
        <div className="owner-dashboard__primary" data-animate>
          <section className="owner-dashboard__panel card">
            <header>
              <h2>Site sections</h2>
              <p>Edit hero, promo, dan copy setiap halaman.</p>
            </header>
            <Suspense fallback={<DashboardSkeleton />}>
              <div className="owner-dashboard__section-list">
                {sections.map((section) => (
                  <EditableSectionCard key={section.id} section={section} />
                ))}
              </div>
            </Suspense>
          </section>

          <section className="owner-dashboard__panel card">
            <header>
              <h2>Storytelling assets</h2>
              <p>Kelola studi kasus dan testimoni untuk ditampilkan publik.</p>
            </header>
            <div className="owner-dashboard__panel-grid">
              <ProjectList projects={projects} />
              <TestimonialList testimonials={testimonials} />
            </div>
          </section>
        </div>

        <aside className="owner-dashboard__aside" data-animate>
          <AgentLogPanel logs={agentLogs} />
        </aside>
      </div>
    </div>
  );
}

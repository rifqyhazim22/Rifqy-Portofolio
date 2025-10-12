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
    <div className="space-y-8 pb-16">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-blue-500/10 to-sky-500/20 p-8 shadow-lg shadow-slate-900/40">
        <h1 className="text-3xl font-semibold text-white">
          Owner Command Center
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Craft narratives, track AI agent usage, and orchestrate your website
          experience without touching code. All changes persist immediately in
          Supabase so you can iterate fast and safely.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-white/70 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Sections managed
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {sections.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Projects live
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {projects.filter((item) => item.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Unique visitor intros (30d)
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {uniqueVisitorCount}
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="space-y-6">
          {sections.map((section) => (
            <EditableSectionCard key={section.id} section={section} />
          ))}
        </div>
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectList projects={projects} />
        <TestimonialList testimonials={testimonials} />
      </div>

      <AgentLogPanel logs={agentLogs} />
    </div>
  );
}

import { Suspense } from "react";
import { AgentLogPanel, type AgentLogRecord } from "./_components/AgentLogPanel";
import { createSupabaseServiceClient } from "@/lib/supabase";

const fetchOverviewData = async () => {
  const supabase = createSupabaseServiceClient();

  const [
    sections,
    projects,
    assets,
    automations,
    agentSessions,
  ] = await Promise.all([
    supabase.from("site_sections").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("media_assets").select("id", { count: "exact", head: true }),
    supabase.from("automations").select("id", { count: "exact", head: true }),
    supabase
      .from("agent_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const agentLogs = (agentSessions.data ?? []) as AgentLogRecord[];

  return {
    metrics: {
      sections: sections.count ?? 0,
      projects: projects.count ?? 0,
      assets: assets.count ?? 0,
      automations: automations.count ?? 0,
    },
    agentLogs,
  };
};

const DashboardSkeleton = () => (
  <div className="owner-dashboard__skeleton">
    <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
    <div className="grid gap-6 lg:grid-cols-2 mt-6">
      <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
      <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
    </div>
  </div>
);

export default async function OwnerOverviewPage() {
  const { metrics, agentLogs } = await fetchOverviewData();

  return (
    <div className="owner-dashboard" data-animate>
      <section className="owner-dashboard__hero">
        <div>
          <p className="owner-dashboard__eyebrow">Rifqy Hazim HR • Owner console</p>
          <h1>Mission control</h1>
          <p>
            Kelola konten, aset media, dan orkestrasi automations yang menopang website dan agen.
          </p>
        </div>
        <div className="owner-dashboard__stats">
          <article>
            <span>Content blocks</span>
            <strong>{metrics.sections}</strong>
          </article>
          <article>
            <span>Projects</span>
            <strong>{metrics.projects}</strong>
          </article>
          <article>
            <span>Media assets</span>
            <strong>{metrics.assets}</strong>
          </article>
          <article>
            <span>Agent kits</span>
            <strong>{metrics.automations}</strong>
          </article>
        </div>
      </section>

      <div className="owner-dashboard__columns">
        <div className="owner-dashboard__primary">
          <Suspense fallback={<DashboardSkeleton />}>
            <AgentLogPanel logs={agentLogs} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

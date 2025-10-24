import { SiteSectionsPanel, type SiteSection } from "../_components/SiteSectionsPanel";
import { ProjectsPanel, type ProjectRecord } from "../_components/ProjectsPanel";
import { createSupabaseServiceClient } from "@/lib/supabase";

const fetchContentData = async () => {
  const supabase = createSupabaseServiceClient();

  const [sectionsResponse, projectsResponse] = await Promise.all([
    supabase.from("site_sections").select("*").order("slug", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false }),
  ]);

  return {
    sections: (sectionsResponse.data ?? []) as SiteSection[],
    projects: (projectsResponse.data ?? []) as ProjectRecord[],
  };
};

export default async function OwnerContentPage() {
  const { sections, projects } = await fetchContentData();

  return (
    <div className="owner-dashboard" data-animate>
      <div className="owner-dashboard__panel-stack">
        <SiteSectionsPanel sections={sections} />
        <ProjectsPanel projects={projects} />
      </div>
    </div>
  );
}

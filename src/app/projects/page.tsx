import NextSteps from "@/components/NextSteps";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentLanguage } from "@/lib/language";
import { fetchPublishedProjects } from "@/lib/supabase/content";

export default async function ProjectsPage() {
  const language = await getCurrentLanguage();
  const dictionary = getDictionary(language);
  const { projects, nextStepsHeading, navLabels } = dictionary;
  const supabaseProjects = await fetchPublishedProjects();

  const gallery = supabaseProjects.length
    ? supabaseProjects.map((project) => ({
        href: project.link_url ?? (project.slug ? `/projects/${project.slug}` : "#"),
        title: project.title,
        sub: project.tagline ?? project.description ?? "",
      }))
    : projects.gallery;

  return (
    <div className="projects">
      <h1 className="h1">{projects.title}</h1>
      <p className="sub">{projects.intro}</p>

      <div className="nav" style={{ margin: "12px 0 18px 0" }} data-animate>
        {projects.buttons.map((button) => (
          <a key={button.label} className="pill" href={button.href} target="_blank" rel="noopener">
            {button.label}
          </a>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: "6px" }} data-animate>
        {gallery.map((item) => (
          <a key={item.title} className="card" href={item.href} target="_blank" rel="noopener">
            <div className="k">{item.title}</div>
            <div className="sub">{item.sub}</div>
          </a>
        ))}
      </div>

      <div className="hr" data-animate />

      <div data-animate>
        <NextSteps current="projects" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

import { ChatAgentsPanel } from "./ChatAgentsPanel";
import { LibrarianAgentsPanel } from "./LibrarianAgentsPanel";
import { CreateAgentPanel } from "./CreateAgentPanel";
import { listAiAgents } from "@/lib/supabase";

export default async function OwnerAgentsPage() {
  const agents = await listAiAgents();
  const chatAgents = agents.filter((agent) => agent.type === "chat");
  const librarianAgents = agents.filter((agent) => agent.type === "librarian");
  const otherAgents = agents.filter((agent) => agent.type !== "chat" && agent.type !== "librarian");

  return (
    <div className="owner-dashboard" data-animate>
      <div className="owner-dashboard__panel-stack">
        <ChatAgentsPanel agents={chatAgents} />
        <LibrarianAgentsPanel agents={librarianAgents} />
        {otherAgents.length ? (
          <section className="owner-story-card">
            <header className="owner-story-card__header">
              <div className="owner-story-card__title">
                <h3>Other agents</h3>
                <p>Agents dengan tipe kustom tetap bisa diedit langsung via Supabase.</p>
              </div>
            </header>
            <ul className="owner-story-card__list owner-story-card__list--inline">
              {otherAgents.map((agent) => (
                <li key={agent.id}>
                  <strong>{agent.name}</strong>
                  <span>{agent.slug}</span>
                  <span>{agent.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <CreateAgentPanel />
      </div>
    </div>
  );
}

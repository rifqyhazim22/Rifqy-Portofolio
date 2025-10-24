import { createSupabaseServiceClient, listAiAgents } from "@/lib/supabase";
import { AgentCanvas } from "./AgentCanvas";

export default async function OwnerAgentCanvasPage() {
  const [agents, assets] = await Promise.all([
    listAiAgents(),
    (async () => {
      const supabase = createSupabaseServiceClient();
      const { data } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    })(),
  ]);

  return (
    <div className="owner-dashboard" data-animate>
      <AgentCanvas agents={agents} assets={assets} />
    </div>
  );
}

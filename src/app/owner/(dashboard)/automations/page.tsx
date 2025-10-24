import { AutomationCanvas } from "./AutomationCanvas";
import { listAutomations } from "@/lib/supabase/owner-automations";

export default async function OwnerAutomationsPage() {
  const automations = await listAutomations();

  return (
    <div className="owner-dashboard" data-animate>
      <AutomationCanvas automations={automations} />
    </div>
  );
}

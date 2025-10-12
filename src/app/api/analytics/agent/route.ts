import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    visitorName,
    visitorEmail,
    referrer,
    agentType,
    intent,
    metadata,
  } = payload as Record<string, unknown>;

  if (typeof agentType !== "string" || !agentType.length) {
    return NextResponse.json({ error: "agentType is required" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("agent_sessions").insert({
    visitor_name: typeof visitorName === "string" ? visitorName.slice(0, 160) : null,
    visitor_email:
      typeof visitorEmail === "string" ? visitorEmail.slice(0, 160) : null,
    referrer: typeof referrer === "string" ? referrer.slice(0, 255) : null,
    agent_type: agentType,
    intent: typeof intent === "string" ? intent.slice(0, 255) : null,
    metadata: metadata && typeof metadata === "object" ? metadata : null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to log session" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


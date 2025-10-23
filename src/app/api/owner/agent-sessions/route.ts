import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { guardOwner } from "../_utils";

export async function GET(request: NextRequest) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const supabase = createSupabaseServiceClient();
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limitValue = limitParam ? Number(limitParam) : 50;
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(1, limitValue), 200) : 50;

  const { data, error } = await supabase
    .from("agent_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch agent sessions", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";

type MissionStatus = "locked" | "active" | "completed";

interface ProgressPayload {
  playbookId: string;
  status: MissionStatus;
  xp: number;
  streak: number;
  completedLevels: string[];
  claimedRewards: string[];
}

const defaultProgress = (playbookId: string): ProgressPayload => ({
  playbookId,
  status: "locked",
  xp: 0,
  streak: 0,
  completedLevels: [],
  claimedRewards: [],
});

export async function GET(_request: NextRequest, context: any) {
  const playbookId = context?.params?.playbookId as string | undefined;
  if (!playbookId) {
    return NextResponse.json({ error: "Playbook id is required" }, { status: 400 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createSupabaseServiceClient();
    const { data, error } = await serviceClient
      .from("playbook_progress")
      .select("status, xp, streak, completed_levels, claimed_rewards")
      .eq("user_id", user.id)
      .eq("playbook_id", playbookId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(defaultProgress(playbookId));
    }

    return NextResponse.json({
      playbookId,
      status: (data.status as MissionStatus) ?? "locked",
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      completedLevels: (data.completed_levels as string[]) ?? [],
      claimedRewards: (data.claimed_rewards as string[]) ?? [],
    });
  } catch (error) {
    console.error("Failed to read playbook progress", error);
    return NextResponse.json(defaultProgress(playbookId));
  }
}

export async function PATCH(request: NextRequest, context: any) {
  const playbookId = context?.params?.playbookId as string | undefined;
  if (!playbookId) {
    return NextResponse.json({ error: "Playbook id is required" }, { status: 400 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as ProgressPayload;
    if (!payload || payload.playbookId !== playbookId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient.from("playbook_progress").upsert(
      {
        user_id: user.id,
        playbook_id: playbookId,
        status: payload.status,
        xp: payload.xp,
        streak: payload.streak,
        completed_levels: payload.completedLevels,
        claimed_rewards: payload.claimedRewards,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,playbook_id" },
    );

    if (error) {
      console.error("Failed to save playbook progress", error);
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to update playbook progress", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

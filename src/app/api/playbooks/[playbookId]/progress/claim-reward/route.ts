import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest, context: any) {
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

    const body = (await request.json()) as { rewardIds?: string[] };
    const rewardIds = Array.isArray(body.rewardIds) ? body.rewardIds : [];

    if (!rewardIds.length) {
      return NextResponse.json({ error: "Reward IDs required" }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceClient();
    const { data, error: fetchError } = await serviceClient
      .from("playbook_progress")
      .select("claimed_rewards")
      .eq("user_id", user.id)
      .eq("playbook_id", playbookId)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch rewards", fetchError);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    const currentRewards = new Set<string>((data?.claimed_rewards as string[]) ?? []);
    rewardIds.forEach((rewardId) => currentRewards.add(rewardId));
    const mergedRewards = Array.from(currentRewards);

    const { error: updateError } = await serviceClient
      .from("playbook_progress")
      .update({
        claimed_rewards: mergedRewards,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("playbook_id", playbookId);

    if (updateError) {
      console.error("Failed to update rewards", updateError);
      return NextResponse.json({ error: "Failed to update rewards" }, { status: 500 });
    }

    return NextResponse.json({ playbookId, claimedRewards: mergedRewards });
  } catch (error) {
    console.error("Failed to claim reward", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

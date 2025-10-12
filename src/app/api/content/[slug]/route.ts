import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function GET(_: NextRequest, context: any) {
  const slug = context?.params?.slug as string | undefined;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_sections")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to load content", details: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

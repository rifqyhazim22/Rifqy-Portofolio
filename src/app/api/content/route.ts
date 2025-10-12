import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

type TableKey = "site_sections" | "projects" | "testimonials";

const TABLE_CONFIG: Record<
  TableKey,
  { orderBy?: string; orderAscending?: boolean }
> = {
  site_sections: { orderBy: "slug", orderAscending: true },
  projects: { orderBy: "display_order", orderAscending: true },
  testimonials: { orderBy: "display_order", orderAscending: true },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const table = (searchParams.get("table") ?? "site_sections") as TableKey;

  if (!TABLE_CONFIG[table]) {
    return NextResponse.json({ error: "Unsupported content table" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase.from(table).select("*");

  const config = TABLE_CONFIG[table];
  if (config.orderBy) {
    query = query.order(config.orderBy, { ascending: config.orderAscending ?? true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to query content", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}


import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSiteSectionRecord } from "@/lib/supabase/owner-content";
import {
  guardOwner,
  ownerErrorResponse,
  parseJson,
  revalidateOwnerContent,
} from "../_utils";
import { buildCreateSectionInput } from "./_helpers";

export async function GET() {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_sections")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch sections", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const body = await parseJson<Record<string, unknown>>(request);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { input, error } = buildCreateSectionInput(body);
  if (!input) {
    return NextResponse.json(
      { error: error ?? "Invalid payload" },
      { status: 422 },
    );
  }

  try {
    const record = await createSiteSectionRecord(input);
    revalidateOwnerContent();
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    return ownerErrorResponse(err);
  }
}

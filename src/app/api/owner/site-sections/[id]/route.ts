import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { updateSiteSectionRecord } from "@/lib/supabase/owner-content";
import {
  guardOwner,
  ownerErrorResponse,
  parseJson,
  revalidateOwnerContent,
} from "../../_utils";
import { buildUpdateSectionInput } from "../_helpers";

const missingIdResponse = () =>
  NextResponse.json({ error: "Section id is required" }, { status: 400 });

export async function GET(_: NextRequest, context: any) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const id = context?.params?.id as string | undefined;
  if (!id) return missingIdResponse();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_sections")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch section", details: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Section not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  context: any,
) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const id = context?.params?.id as string | undefined;
  if (!id) return missingIdResponse();

  const body = await parseJson<Record<string, unknown>>(request);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { input, error } = buildUpdateSectionInput(body);
  if (!input) {
    return NextResponse.json(
      { error: error ?? "Invalid payload" },
      { status: 422 },
    );
  }

  try {
    const record = await updateSiteSectionRecord({ id, ...input });
    revalidateOwnerContent();
    return NextResponse.json(record);
  } catch (err) {
    return ownerErrorResponse(err);
  }
}

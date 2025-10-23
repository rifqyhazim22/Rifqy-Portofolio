import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { upsertTestimonialRecord } from "@/lib/supabase/owner-content";
import {
  guardOwner,
  ownerErrorResponse,
  parseJson,
  revalidateOwnerContent,
} from "../_utils";
import { buildTestimonialInput } from "./_helpers";

export async function GET() {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error.message },
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

  const input = buildTestimonialInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Name and quote are required" },
      { status: 422 },
    );
  }

  try {
    const record = await upsertTestimonialRecord(input);
    revalidateOwnerContent();
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return ownerErrorResponse(error);
  }
}

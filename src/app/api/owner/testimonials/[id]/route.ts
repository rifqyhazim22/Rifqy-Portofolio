import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  deleteTestimonialRecord,
  upsertTestimonialRecord,
} from "@/lib/supabase/owner-content";
import {
  guardOwner,
  ownerErrorResponse,
  parseJson,
  revalidateOwnerContent,
} from "../../_utils";
import { buildTestimonialInput } from "../_helpers";

const missingIdResponse = () =>
  NextResponse.json({ error: "Testimonial id is required" }, { status: 400 });

export async function GET(_: NextRequest, context: any) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const id = context?.params?.id as string | undefined;
  if (!id) return missingIdResponse();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch testimonial", details: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Testimonial not found" },
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

  const input = buildTestimonialInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Name and quote are required" },
      { status: 422 },
    );
  }

  input.id = id;

  try {
    const record = await upsertTestimonialRecord(input);
    revalidateOwnerContent();
    return NextResponse.json(record);
  } catch (error) {
    return ownerErrorResponse(error);
  }
}

export async function DELETE(_: NextRequest, context: any) {
  const authResponse = await guardOwner();
  if (authResponse) return authResponse;

  const id = context?.params?.id as string | undefined;
  if (!id) return missingIdResponse();

  try {
    await deleteTestimonialRecord(id);
    revalidateOwnerContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    return ownerErrorResponse(error);
  }
}

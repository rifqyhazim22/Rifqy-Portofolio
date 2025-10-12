import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  let payload: {
    name?: string;
    email?: string;
    source?: string;
    message?: string;
    language?: string;
    page?: string;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const name = payload.name?.trim();
  const source = payload.source?.trim();
  const message = payload.message?.trim();
  const email = payload.email?.trim() ?? null;

  if (!name || !source || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const metadata = {
    language: payload.language ?? null,
    page: payload.page ?? null,
    userAgent: request.headers.get("user-agent"),
  };

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    source,
    message,
    metadata,
  });

  if (error) {
    console.error("Failed to store contact message", error);
    return NextResponse.json({ error: "Failed to store contact message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

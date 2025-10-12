import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmail = process.env.SUPABASE_OWNER_EMAIL?.toLowerCase();
  const isOwner =
    !!user && (!allowedEmail || user.email?.toLowerCase() === allowedEmail);

  return NextResponse.json({ isOwner });
}

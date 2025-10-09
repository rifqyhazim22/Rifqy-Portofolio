import { NextRequest, NextResponse } from "next/server";
import { getSiteContext, updateSiteContext } from "@/lib/contextProtocol";

export async function GET() {
  const context = getSiteContext();
  return NextResponse.json(context);
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json();
    const context = updateSiteContext(payload);
    return NextResponse.json(context);
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

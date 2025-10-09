import { NextRequest, NextResponse } from "next/server";
import { getSiteContext, updateSiteContext } from "@/lib/contextProtocol";

interface McpRequest {
  command: "list" | "get" | "update";
  sectionId?: string;
  payload?: unknown;
}

export async function POST(request: NextRequest) {
  let body: McpRequest;

  try {
    body = (await request.json()) as McpRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const context = getSiteContext();

  switch (body.command) {
    case "list":
      return NextResponse.json({ context });
    case "get": {
      const section = context.sections.find((item) => item.id === body.sectionId);
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }
      return NextResponse.json({ section });
    }
    case "update": {
      if (typeof body.payload !== "object" || body.payload === null) {
        return NextResponse.json({ error: "Payload required for update" }, { status: 400 });
      }
      const updated = updateSiteContext(body.payload as Record<string, unknown>);
      return NextResponse.json({ context: updated });
    }
    default:
      return NextResponse.json({ error: "Unsupported command" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(getSiteContext());
}

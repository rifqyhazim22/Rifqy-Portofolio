import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { OwnerAuthError, requireOwner } from "@/lib/supabase";

export const guardOwner = async () => {
  try {
    await requireOwner();
    return null;
  } catch (error) {
    if (error instanceof OwnerAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
};

export const parseJson = async <T>(request: NextRequest): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

export const ownerErrorResponse = (error: unknown) => {
  console.error("Owner API error", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
};

export const revalidateOwnerContent = () => {
  revalidatePath("/owner");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/works");
  revalidatePath("/about");
};

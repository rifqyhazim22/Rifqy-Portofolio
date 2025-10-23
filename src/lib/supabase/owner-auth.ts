import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./server-client";

export class OwnerAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "OwnerAuthError";
    this.status = status;
  }
}

const normalize = (value?: string | null) =>
  value?.trim().toLowerCase() ?? null;

export const fetchCurrentOwner = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to resolve Supabase user", error);
    return null;
  }

  if (!user) {
    return null;
  }

  const allowedEmail = normalize(process.env.SUPABASE_OWNER_EMAIL);
  if (allowedEmail && normalize(user.email) !== allowedEmail) {
    return null;
  }

  return user;
};

export const requireOwner = async (): Promise<User> => {
  const user = await fetchCurrentOwner();
  if (!user) {
    throw new OwnerAuthError("Unauthorized", 401);
  }
  return user;
};

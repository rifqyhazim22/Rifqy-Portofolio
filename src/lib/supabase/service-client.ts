import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedServiceClient: SupabaseClient | null = null;

const createClientInstance = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

export const getSupabaseServiceClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createClientInstance();
  }

  return cachedServiceClient;
};

export const createSupabaseServiceClient = () => {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Supabase service-role environment variables are missing.");
  }
  return client;
};

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database.types";

/**
 * Cliente Supabase para uso em Client Components ("use client").
 * Usa apenas a anon key — nunca a service_role key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

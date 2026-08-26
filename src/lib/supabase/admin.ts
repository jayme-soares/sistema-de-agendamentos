import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database.types";

/**
 * Cliente Supabase com a service_role key — ignora RLS.
 *
 * USO RESTRITO a código server-side de confiança sem sessão de usuário
 * (ex.: a rota de cron `/api/cron/lembretes`). NUNCA importar este módulo em
 * um Client Component nem expor `SUPABASE_SERVICE_ROLE_KEY` ao navegador.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

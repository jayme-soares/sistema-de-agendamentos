import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/types/database.types";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers. Lê/escreve a sessão via cookies da requisição atual.
 *
 * Chamar `await createClient()` a cada uso (não é seguro reutilizar uma
 * instância entre requisições).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` chamado a partir de um Server Component sem permissão
            // de escrita em cookies — seguro ignorar quando há um proxy
            // (src/proxy.ts) renovando a sessão em paralelo.
          }
        },
      },
    }
  );
}

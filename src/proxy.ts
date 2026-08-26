import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Convenção `proxy.ts` do Next.js 16 (substitui o antigo `middleware.ts`).
// Roda em toda requisição para renovar a sessão do Supabase e proteger as
// rotas autenticadas do grupo `(app)`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto arquivos estáticos e de imagem do
     * Next.js, para não bloquear CSS/JS/imagens.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

// Rotas de API que fazem sua própria autorização (ex.: CRON_SECRET) e não
// dependem de uma sessão de usuário — o proxy não deve redirecioná-las
// para /login nem exigir cookies de sessão.
const BYPASS_PREFIXES = ["/api/cron"];

/**
 * Renova a sessão do Supabase a cada requisição e protege as rotas do
 * grupo `(app)`. Chamado a partir de `src/proxy.ts` (proxy do Next.js —
 * antigo "middleware", renomeado a partir da v16).
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não remover. `getUser()` valida o token com o servidor do
  // Supabase (diferente de `getSession()`, que apenas lê o cookie) e é o
  // que efetivamente renova a sessão a cada requisição.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

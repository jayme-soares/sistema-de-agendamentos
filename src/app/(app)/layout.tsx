import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { buscarPerfilAtual } from "@/lib/data/usuarios";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Segunda checagem server-side (defesa em profundidade), além do proxy
  // (src/proxy.ts) que já protege as rotas deste grupo. Só redirecionamos
  // para /login quando de fato não há sessão — nunca a partir daqui em
  // diante, para não arriscar um loop com o proxy (que manda usuário já
  // autenticado que visita /login de volta para as rotas protegidas).
  if (!user) {
    redirect("/login");
  }

  // buscarPerfilAtual() garante que exista um perfil para este usuário
  // (cria um na hora se faltar, ex.: trigger que não rodou).
  const perfil = await buscarPerfilAtual();

  if (!perfil) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar seu perfil agora. Tente novamente em instantes.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </div>
    );
  }

  // Cadastro ainda não aprovado (ou rejeitado) por um administrador: não
  // libera o acesso às telas do sistema.
  if (perfil.status_conta !== "aprovado") {
    redirect("/aguardando-aprovacao");
  }

  const isAdmin = perfil.role === "admin";

  let pendentes = 0;
  if (isAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status_conta", "pendente");
    pendentes = count ?? 0;
  }

  return (
    <SidebarProvider>
      <AppSidebar nome={perfil.nome} email={perfil.email} isAdmin={isAdmin} pendentes={pendentes} />
      <SidebarInset>
        <SiteHeader />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

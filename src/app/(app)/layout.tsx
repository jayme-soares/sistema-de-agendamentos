import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Segunda checagem server-side (defesa em profundidade), além do proxy
  // (src/proxy.ts) que já protege as rotas deste grupo.
  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome, email, role, status_conta")
    .eq("id", user.id)
    .maybeSingle();

  // Cadastro ainda não aprovado (ou rejeitado) por um administrador: não
  // libera o acesso às telas do sistema.
  if (!perfil || perfil.status_conta !== "aprovado") {
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

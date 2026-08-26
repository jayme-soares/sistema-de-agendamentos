import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role, status_conta")
    .eq("id", user.id)
    .maybeSingle();

  // O grupo (app) já garante status_conta === "aprovado"; aqui só falta
  // restringir às contas com papel de administrador.
  if (perfil?.role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}

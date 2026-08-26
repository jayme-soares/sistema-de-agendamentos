import { redirect } from "next/navigation";

import { UsuariosAdminPanel } from "@/components/admin/UsuariosAdminPanel";
import { listarTodosUsuarios } from "@/lib/data/usuarios";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuarios = await listarTodosUsuarios();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="text-muted-foreground">
          Aprove novos cadastros e gerencie quem tem acesso ao sistema.
        </p>
      </div>

      <UsuariosAdminPanel usuarios={usuarios} perfilAtualId={user.id} />
    </div>
  );
}

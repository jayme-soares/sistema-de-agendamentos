import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

/** Perfil do usuário autenticado atual (ou `null` se não houver sessão). */
export async function buscarPerfilAtual(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

/** Todos os usuários com cadastro aguardando aprovação, mais antigos primeiro. */
export async function listarUsuariosPendentes(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status_conta", "pendente")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Erro ao listar usuários pendentes: ${error.message}`);
  return data ?? [];
}

/** Todos os usuários do sistema (para o painel de administração). */
export async function listarTodosUsuarios(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Erro ao listar usuários: ${error.message}`);
  return data ?? [];
}

/** E-mails de todos os usuários com cadastro aprovado (destino dos lembretes). */
export async function listarEmailsAprovados(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("status_conta", "aprovado");

  if (error) throw new Error(`Erro ao listar e-mails de usuários aprovados: ${error.message}`);
  return (data ?? []).map((p) => p.email);
}

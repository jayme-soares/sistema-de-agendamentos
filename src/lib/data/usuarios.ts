import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

/**
 * Perfil do usuário autenticado atual (ou `null` se não houver sessão).
 *
 * Usa a função `garantir_meu_perfil` no banco em vez de um SELECT direto:
 * se por algum motivo o perfil não existir (trigger que não rodou, linha
 * apagada manualmente, etc.), ela cria o perfil na hora. Isso evita que um
 * usuário autenticado sem perfil fique preso — nunca redirecione essa
 * ausência para /login aqui, pois o proxy já garante que só chega até este
 * ponto quem tem sessão válida, e mandar de volta pro login criaria um loop
 * (o proxy manda usuário autenticado que visita /login de volta pra cá).
 */
export async function buscarPerfilAtual(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("garantir_meu_perfil");
  if (error) {
    console.error("Falha ao buscar/criar perfil do usuário:", error.message);
    return null;
  }
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

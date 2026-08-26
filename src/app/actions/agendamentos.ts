"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  adiarSchema,
  agendamentoSchema,
} from "@/lib/validations/agendamento.schema";
import { datetimeLocalParaIso } from "@/lib/utils/date";
import type { StatusAgendamento } from "@/lib/types/database.types";

export interface ActionState {
  error?: string;
}

function revalidarTudo(id?: string) {
  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  revalidatePath("/relatorios");
  if (id) revalidatePath(`/agendamentos/${id}`);
}

function lerCamposFormulario(formData: FormData) {
  return agendamentoSchema.safeParse({
    numero_os: formData.get("numero_os"),
    tipo_servico: formData.get("tipo_servico"),
    cliente_nome: formData.get("cliente_nome"),
    cliente_contato: formData.get("cliente_contato"),
    data_agendamento_local: formData.get("data_agendamento_local"),
    observacoes: formData.get("observacoes") ?? "",
  });
}

/** Cria um novo agendamento (status inicial sempre "pendente"). */
export async function criarAgendamento(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = lerCamposFormulario(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase.from("agendamentos").insert({
    numero_os: parsed.data.numero_os,
    tipo_servico: parsed.data.tipo_servico,
    cliente_nome: parsed.data.cliente_nome,
    cliente_contato: parsed.data.cliente_contato,
    data_agendamento: datetimeLocalParaIso(parsed.data.data_agendamento_local),
    observacoes: parsed.data.observacoes || null,
    created_by: user.id,
  });

  if (error) {
    return { error: `Não foi possível salvar o agendamento: ${error.message}` };
  }

  revalidarTudo();
  redirect("/agendamentos");
}

/** Edita os campos cadastrais de um agendamento — só permitido enquanto "pendente". */
export async function editarAgendamento(
  id: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = lerCamposFormulario(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { data: atual, error: fetchError } = await supabase
    .from("agendamentos")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !atual) return { error: "Agendamento não encontrado" };
  if (atual.status !== "pendente") {
    return { error: "Só é possível editar agendamentos com status Pendente" };
  }

  const { error } = await supabase
    .from("agendamentos")
    .update({
      numero_os: parsed.data.numero_os,
      tipo_servico: parsed.data.tipo_servico,
      cliente_nome: parsed.data.cliente_nome,
      cliente_contato: parsed.data.cliente_contato,
      data_agendamento: datetimeLocalParaIso(parsed.data.data_agendamento_local),
      observacoes: parsed.data.observacoes || null,
    })
    .eq("id", id);

  if (error) {
    return { error: `Não foi possível salvar as alterações: ${error.message}` };
  }

  revalidarTudo(id);
  redirect(`/agendamentos/${id}`);
}

async function alterarStatusSimples(
  id: string,
  statusEsperado: StatusAgendamento,
  novoStatus: StatusAgendamento
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: atual, error: fetchError } = await supabase
    .from("agendamentos")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !atual) return { error: "Agendamento não encontrado" };
  if (atual.status !== statusEsperado) {
    return {
      error: `Só é possível alterar agendamentos com status "${statusEsperado}"`,
    };
  }

  const { error } = await supabase
    .from("agendamentos")
    .update({ status: novoStatus })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidarTudo(id);
  return {};
}

/** Cancela um agendamento pendente. */
export async function cancelarAgendamento(id: string): Promise<ActionState> {
  return alterarStatusSimples(id, "pendente", "cancelado");
}

/** Marca um agendamento pendente como realizado. */
export async function marcarRealizado(id: string): Promise<ActionState> {
  return alterarStatusSimples(id, "pendente", "realizado");
}

/**
 * Adia um agendamento pendente: marca o atual como "adiado" e cria um novo
 * registro "pendente" com a nova data, via a função transacional do banco
 * (`adiar_agendamento`).
 */
export async function adiarAgendamento(
  id: string,
  novaDataLocal: string,
  motivo?: string
): Promise<ActionState & { novoId?: string }> {
  const parsed = adiarSchema.safeParse({
    nova_data_local: novaDataLocal,
    motivo: motivo ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data, error } = await supabase.rpc("adiar_agendamento", {
    p_id: id,
    p_nova_data: datetimeLocalParaIso(parsed.data.nova_data_local),
    p_motivo: parsed.data.motivo || null,
    p_created_by: user.id,
  });

  if (error) {
    return { error: `Não foi possível adiar: ${error.message}` };
  }

  revalidarTudo(id);
  const novoId = (data as { id?: string } | null)?.id;
  if (novoId) revalidatePath(`/agendamentos/${novoId}`);

  return { novoId };
}

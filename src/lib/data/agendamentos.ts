import "server-only";

import { createClient } from "@/lib/supabase/server";
import { rangeHoje, rangeProximosDias } from "@/lib/utils/date";
import { DIAS_PROXIMOS_AGENDAMENTOS } from "@/lib/constants";
import type { Agendamento, StatusAgendamento } from "@/lib/types/database.types";

export interface FiltrosListagem {
  status?: StatusAgendamento;
  busca?: string;
  de?: string;
  ate?: string;
  tipo_servico?: string;
}

/** Listagem geral de agendamentos, com filtros opcionais, mais recentes primeiro. */
export async function listarAgendamentos(filtros: FiltrosListagem = {}): Promise<Agendamento[]> {
  const supabase = await createClient();
  let query = supabase
    .from("agendamentos")
    .select("*")
    .order("data_agendamento", { ascending: false });

  if (filtros.status) {
    query = query.eq("status", filtros.status);
  }
  if (filtros.de) {
    query = query.gte("data_agendamento", filtros.de);
  }
  if (filtros.ate) {
    query = query.lte("data_agendamento", filtros.ate);
  }
  if (filtros.tipo_servico) {
    query = query.ilike("tipo_servico", `%${filtros.tipo_servico}%`);
  }
  if (filtros.busca) {
    // Remove caracteres que têm significado especial na mini-linguagem de
    // filtros do PostgREST (`,`, `(`, `)`) para que a busca do usuário não
    // seja interpretada como múltiplas condições.
    const termo = filtros.busca.trim().replace(/[,()]/g, " ");
    query = query.or(
      `numero_os.ilike.%${termo}%,cliente_nome.ilike.%${termo}%,tipo_servico.ilike.%${termo}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar agendamentos: ${error.message}`);
  return data ?? [];
}

/** Um agendamento por id. */
export async function buscarAgendamento(id: string): Promise<Agendamento | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar agendamento: ${error.message}`);
  return data;
}

/**
 * Toda a cadeia de reagendamentos de uma OS (registro raiz + todos os que
 * derivam dele), ordenada cronologicamente pela data agendada.
 */
export async function buscarCadeiaDoAgendamento(agendamento: Agendamento): Promise<Agendamento[]> {
  const raizId = agendamento.original_id ?? agendamento.id;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .or(`id.eq.${raizId},original_id.eq.${raizId}`)
    .order("data_agendamento", { ascending: true });

  if (error) throw new Error(`Erro ao buscar histórico do agendamento: ${error.message}`);
  return data ?? [];
}

/** Contagem de agendamentos por status, para os cards do dashboard. */
export async function contarPorStatus(): Promise<Record<StatusAgendamento, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agendamentos").select("status");
  if (error) throw new Error(`Erro ao contar agendamentos: ${error.message}`);

  const contagem: Record<StatusAgendamento, number> = {
    pendente: 0,
    realizado: 0,
    cancelado: 0,
    adiado: 0,
  };
  for (const row of data ?? []) {
    contagem[row.status as StatusAgendamento] += 1;
  }
  return contagem;
}

/** Agendamentos pendentes com data dentro de hoje (fuso America/Sao_Paulo). */
export async function listarAgendamentosDeHoje(): Promise<Agendamento[]> {
  const { inicio, fim } = rangeHoje();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("status", "pendente")
    .gte("data_agendamento", inicio.toISOString())
    .lt("data_agendamento", fim.toISOString())
    .order("data_agendamento", { ascending: true });

  if (error) throw new Error(`Erro ao buscar agendamentos de hoje: ${error.message}`);
  return data ?? [];
}

/** Agendamentos pendentes nos próximos N dias (a partir de amanhã). */
export async function listarProximosAgendamentos(
  dias: number = DIAS_PROXIMOS_AGENDAMENTOS
): Promise<Agendamento[]> {
  const { inicio, fim } = rangeProximosDias(dias);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("status", "pendente")
    .gte("data_agendamento", inicio.toISOString())
    .lt("data_agendamento", fim.toISOString())
    .order("data_agendamento", { ascending: true });

  if (error) throw new Error(`Erro ao buscar próximos agendamentos: ${error.message}`);
  return data ?? [];
}

/** Pendentes cuja data já passou — provável esquecimento de atualizar o status. */
export async function listarAgendamentosAtrasados(): Promise<Agendamento[]> {
  const { inicio } = rangeHoje();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("status", "pendente")
    .lt("data_agendamento", inicio.toISOString())
    .order("data_agendamento", { ascending: true });

  if (error) throw new Error(`Erro ao buscar agendamentos atrasados: ${error.message}`);
  return data ?? [];
}

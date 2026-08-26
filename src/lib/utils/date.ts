import { addDays, startOfDay } from "date-fns";
import { fromZonedTime, formatInTimeZone, toZonedTime } from "date-fns-tz";

import { TIMEZONE } from "@/lib/constants";

/** Início (00:00) do dia civil em America/Sao_Paulo, como instante UTC. */
export function inicioDoDiaUtc(referencia: Date = new Date()): Date {
  const zonado = toZonedTime(referencia, TIMEZONE);
  const inicioZonado = startOfDay(zonado);
  return fromZonedTime(inicioZonado, TIMEZONE);
}

/** Início do dia seguinte (00:00) em America/Sao_Paulo, como instante UTC. */
export function fimDoDiaUtc(referencia: Date = new Date()): Date {
  return addDays(inicioDoDiaUtc(referencia), 1);
}

/** Intervalo [00:00, 24:00) do dia de hoje, no fuso America/Sao_Paulo. */
export function rangeHoje(referencia: Date = new Date()) {
  return { inicio: inicioDoDiaUtc(referencia), fim: fimDoDiaUtc(referencia) };
}

/** Intervalo [amanhã 00:00, amanhã + `dias` 00:00), no fuso America/Sao_Paulo. */
export function rangeProximosDias(dias: number, referencia: Date = new Date()) {
  const inicio = fimDoDiaUtc(referencia);
  const fim = addDays(inicio, dias);
  return { inicio, fim };
}

/** Formata um timestamp ISO para "dd/MM/yyyy às HH:mm", no fuso de Brasília. */
export function formatarDataHora(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "dd/MM/yyyy 'às' HH:mm");
}

/** Formata um timestamp ISO para "dd/MM/yyyy", no fuso de Brasília. */
export function formatarData(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "dd/MM/yyyy");
}

/** Converte um timestamp ISO para o valor esperado por `<input type="datetime-local">`. */
export function paraDatetimeLocalValue(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Converte o valor de um `<input type="datetime-local">` (sem timezone,
 * assumido como horário de Brasília) para um timestamp ISO em UTC.
 */
export function datetimeLocalParaIso(valor: string): string {
  return fromZonedTime(valor, TIMEZONE).toISOString();
}

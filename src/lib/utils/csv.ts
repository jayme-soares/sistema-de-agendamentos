export interface ColunaCsv<T> {
  chave: keyof T;
  titulo: string;
}

/**
 * Gera um CSV (delimitado por `;`, compatível com o Excel em pt-BR) a partir
 * de uma lista de objetos. Inclui BOM UTF-8 para acentuação correta ao abrir
 * no Excel.
 */
export function paraCsv<T extends Record<string, unknown>>(
  linhas: T[],
  colunas: ColunaCsv<T>[]
): string {
  const cabecalho = colunas.map((c) => escapeCsv(c.titulo)).join(";");
  const corpo = linhas.map((linha) =>
    colunas
      .map((c) => escapeCsv(formatarValor(linha[c.chave])))
      .join(";")
  );

  const BOM = "﻿";
  return BOM + [cabecalho, ...corpo].join("\r\n");
}

function formatarValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function escapeCsv(valor: string): string {
  if (/[;"\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

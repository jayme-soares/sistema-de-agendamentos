import { formatarDataHora } from "@/lib/utils/date";
import type { Agendamento } from "@/lib/types/database.types";

/** Monta o assunto e o HTML do e-mail-resumo de agendamentos pendentes do dia. */
export function montarEmailLembreteDia(agendamentos: Agendamento[]) {
  const assunto =
    agendamentos.length === 1
      ? "1 agendamento pendente para hoje"
      : `${agendamentos.length} agendamentos pendentes para hoje`;

  const linhas = agendamentos
    .map(
      (a) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${escapeHtml(a.numero_os)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${escapeHtml(a.tipo_servico)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${escapeHtml(a.cliente_nome)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${escapeHtml(a.cliente_contato)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${formatarDataHora(a.data_agendamento)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
      <h2 style="margin-bottom:4px;">Agendamentos de hoje</h2>
      <p style="color:#555;margin-top:0;">Resumo automático dos agendamentos pendentes marcados para hoje.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr style="background:#f4f4f5;text-align:left;">
            <th style="padding:8px;">Nº OS</th>
            <th style="padding:8px;">Tipo de serviço</th>
            <th style="padding:8px;">Cliente</th>
            <th style="padding:8px;">Contato</th>
            <th style="padding:8px;">Data</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;

  return { assunto, html };
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

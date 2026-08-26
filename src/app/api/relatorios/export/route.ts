import { NextResponse, type NextRequest } from "next/server";

import { listarAgendamentos } from "@/lib/data/agendamentos";
import { STATUS_LABELS } from "@/lib/constants";
import { paraCsv } from "@/lib/utils/csv";
import { datetimeLocalParaIso, formatarDataHora } from "@/lib/utils/date";
import type { StatusAgendamento } from "@/lib/types/database.types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as StatusAgendamento | null;
  const busca = searchParams.get("busca") ?? undefined;
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const agendamentos = await listarAgendamentos({
    status: status ?? undefined,
    busca,
    de: de ? datetimeLocalParaIso(`${de}T00:00`) : undefined,
    ate: ate ? datetimeLocalParaIso(`${ate}T23:59`) : undefined,
  });

  const csv = paraCsv(
    agendamentos.map((a) => ({
      numero_os: a.numero_os,
      tipo_servico: a.tipo_servico,
      cliente_nome: a.cliente_nome,
      cliente_contato: a.cliente_contato,
      data_agendamento: formatarDataHora(a.data_agendamento),
      status: STATUS_LABELS[a.status],
      observacoes: a.observacoes ?? "",
    })),
    [
      { chave: "numero_os", titulo: "Número da OS" },
      { chave: "tipo_servico", titulo: "Tipo de serviço" },
      { chave: "cliente_nome", titulo: "Cliente" },
      { chave: "cliente_contato", titulo: "Contato" },
      { chave: "data_agendamento", titulo: "Data do agendamento" },
      { chave: "status", titulo: "Status" },
      { chave: "observacoes", titulo: "Observações" },
    ]
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="agendamentos.csv"`,
    },
  });
}

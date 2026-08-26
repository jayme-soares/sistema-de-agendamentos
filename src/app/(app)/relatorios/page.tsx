import { Download } from "lucide-react";

import { AgendamentoTable } from "@/components/agendamentos/AgendamentoTable";
import { FiltrosBar } from "@/components/agendamentos/FiltrosBar";
import { Button } from "@/components/ui/button";
import { listarAgendamentos } from "@/lib/data/agendamentos";
import { datetimeLocalParaIso } from "@/lib/utils/date";
import type { StatusAgendamento } from "@/lib/types/database.types";

interface RelatoriosSearchParams {
  status?: StatusAgendamento;
  busca?: string;
  de?: string;
  ate?: string;
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<RelatoriosSearchParams>;
}) {
  const { status, busca, de, ate } = await searchParams;

  const agendamentos = await listarAgendamentos({
    status,
    busca,
    de: de ? datetimeLocalParaIso(`${de}T00:00`) : undefined,
    ate: ate ? datetimeLocalParaIso(`${ate}T23:59`) : undefined,
  });

  const queryString = new URLSearchParams(
    Object.entries({ status, busca, de, ate }).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="text-muted-foreground">
            {agendamentos.length}{" "}
            {agendamentos.length === 1 ? "resultado" : "resultados"} para os filtros selecionados.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/api/relatorios/export${queryString ? `?${queryString}` : ""}`}>
            <Download className="size-4" />
            Exportar CSV
          </a>
        </Button>
      </div>

      <FiltrosBar action="/relatorios" status={status} busca={busca} de={de} ate={ate} />

      <AgendamentoTable agendamentos={agendamentos} />
    </div>
  );
}

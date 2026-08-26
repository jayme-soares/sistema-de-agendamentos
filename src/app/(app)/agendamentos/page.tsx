import Link from "next/link";

import { AgendamentoTable } from "@/components/agendamentos/AgendamentoTable";
import { FiltrosBar } from "@/components/agendamentos/FiltrosBar";
import { Button } from "@/components/ui/button";
import { listarAgendamentos } from "@/lib/data/agendamentos";
import { datetimeLocalParaIso } from "@/lib/utils/date";
import type { StatusAgendamento } from "@/lib/types/database.types";

interface AgendamentosSearchParams {
  status?: StatusAgendamento;
  busca?: string;
  de?: string;
  ate?: string;
}

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<AgendamentosSearchParams>;
}) {
  const { status, busca, de, ate } = await searchParams;

  const agendamentos = await listarAgendamentos({
    status,
    busca,
    de: de ? datetimeLocalParaIso(`${de}T00:00`) : undefined,
    ate: ate ? datetimeLocalParaIso(`${ate}T23:59`) : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Agendamentos</h1>
          <p className="text-muted-foreground">
            {agendamentos.length}{" "}
            {agendamentos.length === 1 ? "agendamento encontrado" : "agendamentos encontrados"}
          </p>
        </div>
        <Button asChild>
          <Link href="/agendamentos/novo">Novo agendamento</Link>
        </Button>
      </div>

      <FiltrosBar action="/agendamentos" status={status} busca={busca} de={de} ate={ate} />

      <AgendamentoTable agendamentos={agendamentos} />
    </div>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ContadoresCards } from "@/components/dashboard/ContadoresCards";
import { ListaAgendamentosResumo } from "@/components/dashboard/ListaAgendamentosResumo";
import { DIAS_PROXIMOS_AGENDAMENTOS } from "@/lib/constants";
import {
  contarPorStatus,
  listarAgendamentosAtrasados,
  listarAgendamentosDeHoje,
  listarProximosAgendamentos,
} from "@/lib/data/agendamentos";

export default async function DashboardPage() {
  const [contagem, hoje, proximos, atrasados] = await Promise.all([
    contarPorStatus(),
    listarAgendamentosDeHoje(),
    listarProximosAgendamentos(),
    listarAgendamentosAtrasados(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Resumo</h1>
          <p className="text-muted-foreground">Visão geral dos agendamentos de ordens de serviço.</p>
        </div>
        <Button asChild>
          <Link href="/agendamentos/novo">Novo agendamento</Link>
        </Button>
      </div>

      <ContadoresCards contagem={contagem} />

      {atrasados.length > 0 && (
        <ListaAgendamentosResumo
          titulo="Atrasados"
          agendamentos={atrasados}
          mensagemVazio="Nenhum agendamento atrasado."
          destacarAtraso
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ListaAgendamentosResumo
          titulo="Agendamentos de hoje"
          agendamentos={hoje}
          mensagemVazio="Nenhum agendamento pendente para hoje."
        />
        <ListaAgendamentosResumo
          titulo={`Próximos agendamentos (${DIAS_PROXIMOS_AGENDAMENTOS} dias)`}
          agendamentos={proximos}
          mensagemVazio="Nenhum agendamento pendente nos próximos dias."
        />
      </div>
    </div>
  );
}

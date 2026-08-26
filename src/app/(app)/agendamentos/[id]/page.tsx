import { notFound } from "next/navigation";

import { AgendamentoAcoes } from "@/components/agendamentos/AgendamentoAcoes";
import { HistoricoReagendamento } from "@/components/agendamentos/HistoricoReagendamento";
import { StatusBadge } from "@/components/agendamentos/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buscarAgendamento, buscarCadeiaDoAgendamento } from "@/lib/data/agendamentos";
import { formatarDataHora } from "@/lib/utils/date";

export default async function DetalheAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agendamento = await buscarAgendamento(id);
  if (!agendamento) notFound();

  const cadeia = await buscarCadeiaDoAgendamento(agendamento);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">OS {agendamento.numero_os}</h1>
          <p className="text-muted-foreground">{agendamento.tipo_servico}</p>
        </div>
        <StatusBadge status={agendamento.status} />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da ordem de serviço</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Campo label="Cliente" valor={agendamento.cliente_nome} />
            <Campo label="Contato" valor={agendamento.cliente_contato} />
            <Campo label="Data do agendamento" valor={formatarDataHora(agendamento.data_agendamento)} />
            <Campo label="Tipo de serviço" valor={agendamento.tipo_servico} />
          </dl>
          {agendamento.observacoes && (
            <>
              <Separator />
              <Campo label="Observações" valor={agendamento.observacoes} />
            </>
          )}
          {agendamento.status === "adiado" && agendamento.motivo_adiamento && (
            <>
              <Separator />
              <Campo label="Motivo do adiamento" valor={agendamento.motivo_adiamento} />
            </>
          )}
        </CardContent>
      </Card>

      <AgendamentoAcoes agendamento={agendamento} />

      <HistoricoReagendamento cadeia={cadeia} atualId={agendamento.id} />
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{valor}</dd>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { editarAgendamento } from "@/app/actions/agendamentos";
import { AgendamentoForm } from "@/components/agendamentos/AgendamentoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarAgendamento } from "@/lib/data/agendamentos";

export default async function EditarAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agendamento = await buscarAgendamento(id);
  if (!agendamento) notFound();

  if (agendamento.status !== "pendente") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Não é possível editar</h1>
        <p className="text-muted-foreground">
          Este agendamento não está mais com status &quot;Pendente&quot; e não pode ser editado.
        </p>
        <Link href={`/agendamentos/${id}`} className="text-sm font-medium underline underline-offset-4">
          Voltar para o detalhe do agendamento
        </Link>
      </div>
    );
  }

  const editarComId = editarAgendamento.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar agendamento</h1>
        <p className="text-muted-foreground">OS {agendamento.numero_os}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da ordem de serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendamentoForm
            action={editarComId}
            agendamento={agendamento}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}

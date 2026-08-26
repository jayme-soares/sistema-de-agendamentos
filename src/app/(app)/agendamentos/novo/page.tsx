import { criarAgendamento } from "@/app/actions/agendamentos";
import { AgendamentoForm } from "@/components/agendamentos/AgendamentoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovoAgendamentoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Novo agendamento</h1>
        <p className="text-muted-foreground">
          O agendamento será registrado com status &quot;Pendente&quot;.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da ordem de serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendamentoForm action={criarAgendamento} submitLabel="Salvar agendamento" />
        </CardContent>
      </Card>
    </div>
  );
}

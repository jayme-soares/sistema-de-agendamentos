"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/actions/agendamentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Agendamento } from "@/lib/types/database.types";
import { paraDatetimeLocalValue } from "@/lib/utils/date";

type FormAction = (
  prevState: ActionState | undefined,
  formData: FormData
) => Promise<ActionState>;

export function AgendamentoForm({
  action,
  agendamento,
  submitLabel,
}: {
  action: FormAction;
  agendamento?: Agendamento;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="numero_os">Número da Ordem de Serviço</Label>
          <Input
            id="numero_os"
            name="numero_os"
            defaultValue={agendamento?.numero_os}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tipo_servico">Tipo de serviço</Label>
          <Input
            id="tipo_servico"
            name="tipo_servico"
            defaultValue={agendamento?.tipo_servico}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cliente_nome">Nome do cliente</Label>
          <Input
            id="cliente_nome"
            name="cliente_nome"
            defaultValue={agendamento?.cliente_nome}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cliente_contato">Contato do cliente</Label>
          <Input
            id="cliente_contato"
            name="cliente_contato"
            placeholder="Telefone ou e-mail"
            defaultValue={agendamento?.cliente_contato}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="data_agendamento_local">Data do agendamento</Label>
          <Input
            id="data_agendamento_local"
            name="data_agendamento_local"
            type="datetime-local"
            defaultValue={
              agendamento ? paraDatetimeLocalValue(agendamento.data_agendamento) : undefined
            }
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={agendamento?.observacoes ?? ""}
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

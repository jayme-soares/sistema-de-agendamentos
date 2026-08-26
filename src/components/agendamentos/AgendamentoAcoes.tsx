"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { cancelarAgendamento, marcarRealizado } from "@/app/actions/agendamentos";
import { AdiarModal } from "@/components/agendamentos/AdiarModal";
import { Button } from "@/components/ui/button";
import type { Agendamento } from "@/lib/types/database.types";

export function AgendamentoAcoes({ agendamento }: { agendamento: Agendamento }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (agendamento.status !== "pendente") return null;

  function handleCancelar() {
    startTransition(async () => {
      const resultado = await cancelarAgendamento(agendamento.id);
      if (resultado.error) toast.error(resultado.error);
      else {
        toast.success("Agendamento cancelado.");
        router.refresh();
      }
    });
  }

  function handleRealizado() {
    startTransition(async () => {
      const resultado = await marcarRealizado(agendamento.id);
      if (resultado.error) toast.error(resultado.error);
      else {
        toast.success("Agendamento marcado como realizado.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <Link href={`/agendamentos/${agendamento.id}/editar`}>Editar</Link>
      </Button>
      <Button variant="outline" disabled={pending} onClick={handleRealizado}>
        Marcar como realizado
      </Button>
      <AdiarModal
        agendamento={agendamento}
        trigger={
          <Button variant="outline" disabled={pending}>
            Adiar
          </Button>
        }
      />
      <Button variant="destructive" disabled={pending} onClick={handleCancelar}>
        Cancelar
      </Button>
    </div>
  );
}

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarDataHora } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Agendamento } from "@/lib/types/database.types";

export function ListaAgendamentosResumo({
  titulo,
  agendamentos,
  mensagemVazio,
  destacarAtraso = false,
}: {
  titulo: string;
  agendamentos: Agendamento[];
  mensagemVazio: string;
  /** Estiliza a lista para chamar atenção (ex: agendamentos atrasados). */
  destacarAtraso?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {titulo}
          <span className="text-sm font-normal text-muted-foreground">
            ({agendamentos.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {agendamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">{mensagemVazio}</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/agendamentos/${agendamento.id}`}
                  className="flex flex-col gap-1 rounded-md transition-colors hover:bg-accent/60 sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:py-1"
                >
                  <div>
                    <p className="font-medium">
                      OS {agendamento.numero_os} — {agendamento.cliente_nome}
                    </p>
                    <p className="text-sm text-muted-foreground">{agendamento.tipo_servico}</p>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      destacarAtraso && "text-destructive"
                    )}
                  >
                    {formatarDataHora(agendamento.data_agendamento)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

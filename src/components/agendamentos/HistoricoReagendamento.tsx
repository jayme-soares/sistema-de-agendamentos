import Link from "next/link";

import { StatusBadge } from "@/components/agendamentos/StatusBadge";
import { cn } from "@/lib/utils";
import { formatarDataHora } from "@/lib/utils/date";
import type { Agendamento } from "@/lib/types/database.types";

export function HistoricoReagendamento({
  cadeia,
  atualId,
}: {
  cadeia: Agendamento[];
  atualId: string;
}) {
  if (cadeia.length <= 1) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Histórico de reagendamentos
      </h2>
      <ol className="flex flex-col gap-3 border-l pl-4">
        {cadeia.map((item) => (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-background",
                item.id === atualId ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
            <Link
              href={`/agendamentos/${item.id}`}
              className={cn(
                "flex flex-col gap-1 rounded-md p-2 transition-colors hover:bg-accent/60 sm:flex-row sm:items-center sm:justify-between",
                item.id === atualId && "bg-accent/60"
              )}
            >
              <span className="text-sm font-medium">{formatarDataHora(item.data_agendamento)}</span>
              <div className="flex items-center gap-2">
                {item.motivo_adiamento && (
                  <span className="text-xs text-muted-foreground">{item.motivo_adiamento}</span>
                )}
                <StatusBadge status={item.status} />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

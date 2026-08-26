import { CalendarClock, CalendarX2, CheckCircle2, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import type { StatusAgendamento } from "@/lib/types/database.types";

const CONFIG: Record<StatusAgendamento, { icon: LucideIcon; className: string }> = {
  pendente: { icon: Clock, className: "text-primary bg-primary/10" },
  realizado: { icon: CheckCircle2, className: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" },
  adiado: { icon: CalendarClock, className: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  cancelado: { icon: CalendarX2, className: "text-destructive bg-destructive/10" },
};

export function ContadoresCards({
  contagem,
}: {
  contagem: Record<StatusAgendamento, number>;
}) {
  const ordem: StatusAgendamento[] = ["pendente", "realizado", "adiado", "cancelado"];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {ordem.map((status) => {
        const { icon: Icon, className } = CONFIG[status];
        return (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {STATUS_LABELS[status]}
              </CardTitle>
              <div className={cn("flex size-8 items-center justify-center rounded-full", className)}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{contagem[status]}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

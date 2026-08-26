import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS } from "@/lib/constants";
import type { StatusAgendamento } from "@/lib/types/database.types";

export function ContadoresCards({
  contagem,
}: {
  contagem: Record<StatusAgendamento, number>;
}) {
  const ordem: StatusAgendamento[] = ["pendente", "realizado", "adiado", "cancelado"];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {ordem.map((status) => (
        <Card key={status}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {STATUS_LABELS[status]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{contagem[status]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

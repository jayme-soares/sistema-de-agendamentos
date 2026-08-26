import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/constants";
import type { StatusAgendamento } from "@/lib/types/database.types";

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

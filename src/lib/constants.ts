import type { PapelUsuario, StatusAgendamento, StatusConta } from "@/lib/types/database.types";

export const TIMEZONE = "America/Sao_Paulo";

/** Janela (em dias, a partir de amanhã) considerada "próximos agendamentos". */
export const DIAS_PROXIMOS_AGENDAMENTOS = 7;

export const STATUS_LABELS: Record<StatusAgendamento, string> = {
  pendente: "Pendente",
  realizado: "Realizado",
  cancelado: "Cancelado",
  adiado: "Adiado",
};

export const STATUS_BADGE_VARIANT: Record<
  StatusAgendamento,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendente: "default",
  realizado: "secondary",
  cancelado: "destructive",
  adiado: "outline",
};

export const STATUS_OPTIONS: { value: StatusAgendamento; label: string }[] = (
  Object.keys(STATUS_LABELS) as StatusAgendamento[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const TIPO_NOTIFICACAO_LEMBRETE_DIA = "lembrete_dia";

export const PAPEL_LABELS: Record<PapelUsuario, string> = {
  admin: "Administrador",
  usuario: "Usuário",
};

export const STATUS_CONTA_LABELS: Record<StatusConta, string> = {
  pendente: "Aguardando aprovação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export const STATUS_CONTA_BADGE_VARIANT: Record<
  StatusConta,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendente: "outline",
  aprovado: "secondary",
  rejeitado: "destructive",
};

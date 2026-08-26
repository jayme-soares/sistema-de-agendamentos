import { z } from "zod";

/** Campos cadastrais de um agendamento (criação e edição). */
export const agendamentoSchema = z.object({
  numero_os: z
    .string()
    .trim()
    .min(1, "Informe o número da OS")
    .max(60, "Máximo de 60 caracteres"),
  tipo_servico: z
    .string()
    .trim()
    .min(1, "Informe o tipo de serviço")
    .max(120, "Máximo de 120 caracteres"),
  cliente_nome: z
    .string()
    .trim()
    .min(1, "Informe o nome do cliente")
    .max(150, "Máximo de 150 caracteres"),
  cliente_contato: z
    .string()
    .trim()
    .min(1, "Informe o contato do cliente")
    .max(150, "Máximo de 150 caracteres"),
  data_agendamento_local: z
    .string()
    .min(1, "Informe a data do agendamento"),
  observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

/** Dados enviados ao confirmar o adiamento de um agendamento. */
export const adiarSchema = z.object({
  nova_data_local: z.string().min(1, "Informe a nova data"),
  motivo: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AdiarFormValues = z.infer<typeof adiarSchema>;

/** Filtros usados na listagem de agendamentos e nos relatórios. */
export const filtrosAgendamentoSchema = z.object({
  status: z.enum(["pendente", "cancelado", "realizado", "adiado"]).optional(),
  tipo_servico: z.string().trim().optional(),
  cliente: z.string().trim().optional(),
  de: z.string().optional(),
  ate: z.string().optional(),
  busca: z.string().trim().optional(),
});

export type FiltrosAgendamento = z.infer<typeof filtrosAgendamentoSchema>;

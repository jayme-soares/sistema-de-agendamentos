-- =============================================================================
-- 0003_indexes.sql
-- Índices de apoio às consultas mais frequentes (dashboard, listagem, relatórios).
-- =============================================================================

create index idx_agendamentos_status
  on public.agendamentos (status);

create index idx_agendamentos_data
  on public.agendamentos (data_agendamento);

create index idx_agendamentos_numero_os
  on public.agendamentos (numero_os);

create index idx_agendamentos_original_id
  on public.agendamentos (original_id);

-- Consulta mais comum do dashboard: pendentes ordenados por data.
create index idx_agendamentos_status_data
  on public.agendamentos (status, data_agendamento);

create index idx_notificacoes_agendamento
  on public.notificacoes_enviadas (agendamento_id);

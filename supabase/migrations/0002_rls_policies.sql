-- =============================================================================
-- 0002_rls_policies.sql
-- Row Level Security: todos os usuários autenticados (mesma empresa) leem e
-- escrevem os mesmos dados de agendamentos. O cron/backend usa a
-- service_role key (que ignora RLS) para operações de sistema.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.agendamentos enable row level security;
alter table public.notificacoes_enviadas enable row level security;

-- profiles ---------------------------------------------------------------
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- agendamentos -------------------------------------------------------------
create policy "agendamentos_select_authenticated"
  on public.agendamentos for select
  to authenticated
  using (true);

create policy "agendamentos_insert_authenticated"
  on public.agendamentos for insert
  to authenticated
  with check (true);

create policy "agendamentos_update_authenticated"
  on public.agendamentos for update
  to authenticated
  using (true)
  with check (true);

-- Não há policy de delete: agendamentos não são apagados, apenas têm o
-- status alterado (histórico permanece rastreável).

-- notificacoes_enviadas ------------------------------------------------------
create policy "notificacoes_select_authenticated"
  on public.notificacoes_enviadas for select
  to authenticated
  using (true);

-- Inserts em notificacoes_enviadas só acontecem via service_role (cron),
-- que ignora RLS — por isso não há policy de insert para `authenticated`.

-- Permite que usuários autenticados chamem a função de adiamento
grant execute on function public.adiar_agendamento(uuid, timestamptz, text, uuid) to authenticated;

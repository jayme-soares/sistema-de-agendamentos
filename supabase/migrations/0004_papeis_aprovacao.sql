-- =============================================================================
-- 0004_papeis_aprovacao.sql
-- Papéis de usuário (admin/usuário) e fluxo de aprovação de cadastro:
-- todo novo cadastro nasce "pendente" e só ganha acesso ao sistema depois
-- que um administrador aprova. O primeiro usuário a se cadastrar no projeto
-- vira administrador automaticamente (bootstrap).
-- =============================================================================

create type public.papel_usuario as enum ('admin', 'usuario');
create type public.status_conta as enum ('pendente', 'aprovado', 'rejeitado');

alter table public.profiles
  add column role public.papel_usuario not null default 'usuario',
  add column status_conta public.status_conta not null default 'pendente';

comment on column public.profiles.role is 'Papel do usuário: "admin" tem acesso ao painel de aprovação de contas.';
comment on column public.profiles.status_conta is 'Situação do cadastro: só usuários "aprovado" conseguem usar o sistema.';

-- ---------------------------------------------------------------------------
-- Bootstrap: o primeiro cadastro do projeto vira admin aprovado automaticamente;
-- os demais nascem "usuario"/"pendente" e aguardam aprovação de um admin.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eh_primeiro boolean;
begin
  select not exists (select 1 from public.profiles) into v_eh_primeiro;

  insert into public.profiles (id, nome, email, role, status_conta)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', new.email),
    new.email,
    case when v_eh_primeiro then 'admin' else 'usuario' end,
    case when v_eh_primeiro then 'aprovado' else 'pendente' end
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Funções auxiliares usadas nas políticas de RLS
-- ---------------------------------------------------------------------------
create function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and role = 'admin' and status_conta = 'aprovado'
  );
$$;

create function public.is_aprovado(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and status_conta = 'aprovado'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_aprovado(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger de proteção: um usuário comum não pode alterar o próprio (ou de
-- outros) `role`/`status_conta` mesmo que a policy de UPDATE permita a
-- linha — só um admin pode efetivamente mudar esses dois campos.
-- ---------------------------------------------------------------------------
create function public.proteger_role_status_conta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status_conta := old.status_conta;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protege_role_status
  before update on public.profiles
  for each row execute procedure public.proteger_role_status_conta();

-- ---------------------------------------------------------------------------
-- RLS: admins podem atualizar qualquer perfil (para aprovar/promover);
-- usuários continuam podendo atualizar o próprio perfil (nome), mas o
-- trigger acima impede que alterem role/status_conta sozinhos.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Agendamentos: só usuários com cadastro aprovado podem ler/escrever.
drop policy if exists "agendamentos_select_authenticated" on public.agendamentos;
drop policy if exists "agendamentos_insert_authenticated" on public.agendamentos;
drop policy if exists "agendamentos_update_authenticated" on public.agendamentos;

create policy "agendamentos_select_aprovado"
  on public.agendamentos for select
  to authenticated
  using (public.is_aprovado());

create policy "agendamentos_insert_aprovado"
  on public.agendamentos for insert
  to authenticated
  with check (public.is_aprovado());

create policy "agendamentos_update_aprovado"
  on public.agendamentos for update
  to authenticated
  using (public.is_aprovado())
  with check (public.is_aprovado());

-- `adiar_agendamento` é security definer (ignora RLS internamente), então
-- precisa da própria checagem de aprovação para não virar um atalho para
-- usuários pendentes/rejeitados mexerem em agendamentos.
create or replace function public.adiar_agendamento(
  p_id uuid,
  p_nova_data timestamptz,
  p_motivo text default null,
  p_created_by uuid default null
)
returns public.agendamentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_original public.agendamentos;
  v_novo public.agendamentos;
begin
  if not public.is_aprovado() then
    raise exception 'Usuário sem acesso aprovado ao sistema';
  end if;

  select * into v_original
  from public.agendamentos
  where id = p_id
  for update;

  if not found then
    raise exception 'Agendamento % não encontrado', p_id;
  end if;

  if v_original.status <> 'pendente' then
    raise exception 'Somente agendamentos pendentes podem ser adiados (status atual: %)', v_original.status;
  end if;

  if p_nova_data = v_original.data_agendamento then
    raise exception 'A nova data deve ser diferente da data atual do agendamento';
  end if;

  update public.agendamentos
  set status = 'adiado',
      motivo_adiamento = p_motivo
  where id = p_id;

  insert into public.agendamentos (
    numero_os, tipo_servico, cliente_nome, cliente_contato,
    data_agendamento, status,
    rescheduled_from_id, original_id, created_by
  ) values (
    v_original.numero_os, v_original.tipo_servico, v_original.cliente_nome, v_original.cliente_contato,
    p_nova_data, 'pendente',
    v_original.id, coalesce(v_original.original_id, v_original.id),
    coalesce(p_created_by, v_original.created_by)
  )
  returning * into v_novo;

  return v_novo;
end;
$$;

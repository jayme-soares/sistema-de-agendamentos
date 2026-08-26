-- =============================================================================
-- 0001_init_schema.sql
-- Schema principal do Sistema de Agendamento de Ordens de Serviço.
-- Cria: enum de status, tabelas (profiles, agendamentos, notificacoes_enviadas),
-- triggers de apoio e a função transacional adiar_agendamento.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enum de status do agendamento
-- ---------------------------------------------------------------------------
create type public.status_agendamento as enum (
  'pendente',
  'cancelado',
  'realizado',
  'adiado'
);

-- ---------------------------------------------------------------------------
-- profiles: espelha auth.users para permitir joins simples (ex: "criado por")
-- sem referenciar o schema `auth` diretamente pela aplicação.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de exibição de cada usuário autenticado (espelha auth.users).';

-- Cria automaticamente um profile sempre que um novo usuário se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- agendamentos: núcleo do sistema
-- ---------------------------------------------------------------------------
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),

  numero_os text not null,
  tipo_servico text not null,
  cliente_nome text not null,
  cliente_contato text not null,
  data_agendamento timestamptz not null,

  status public.status_agendamento not null default 'pendente',
  observacoes text,
  motivo_adiamento text,

  -- encadeamento de reagendamentos (ver README/plano para explicação)
  rescheduled_from_id uuid references public.agendamentos (id) on delete set null,
  original_id uuid references public.agendamentos (id) on delete set null,

  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_nao_referencia_si_mesmo check (id <> rescheduled_from_id)
);

comment on table public.agendamentos is 'Ordens de serviço agendadas. Cada reagendamento (adiamento) cria um novo registro ligado ao anterior.';
comment on column public.agendamentos.numero_os is 'Número da OS. Repete-se entre registros de uma mesma cadeia de reagendamentos (não é única).';
comment on column public.agendamentos.rescheduled_from_id is 'Aponta para o registro imediatamente anterior da cadeia (null na raiz).';
comment on column public.agendamentos.original_id is 'Aponta sempre para o primeiro registro da cadeia (null na raiz) — permite buscar o histórico completo sem CTE recursiva.';

-- Mantém updated_at sempre atualizado
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_agendamentos_updated_at
  before update on public.agendamentos
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notificacoes_enviadas: garante idempotência do envio de e-mails de lembrete
-- ---------------------------------------------------------------------------
create table public.notificacoes_enviadas (
  id uuid primary key default gen_random_uuid(),
  agendamento_id uuid not null references public.agendamentos (id) on delete cascade,
  tipo text not null,
  enviado_em timestamptz not null default now(),
  unique (agendamento_id, tipo)
);

comment on table public.notificacoes_enviadas is 'Registra notificações/e-mails já enviados, evitando duplicidade em reexecuções do cron.';

-- ---------------------------------------------------------------------------
-- adiar_agendamento: transação atômica do fluxo de "Adiar"
--   1) marca o agendamento atual como 'adiado'
--   2) cria um novo registro 'pendente' com a nova data, ligado ao anterior
-- ---------------------------------------------------------------------------
create function public.adiar_agendamento(
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

comment on function public.adiar_agendamento is 'Adia um agendamento pendente: marca o atual como adiado e cria um novo pendente com a nova data, preservando a cadeia de reagendamentos.';

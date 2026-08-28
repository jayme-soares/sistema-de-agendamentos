-- =============================================================================
-- 0006_fix_cast_enum_perfil.sql
-- Corrige um bug em handle_new_user() e garantir_meu_perfil(): um
-- `CASE WHEN ... THEN 'admin' ELSE 'usuario' END` sem cast explícito é
-- resolvido pelo Postgres como `text`, e não existe cast implícito de
-- `text` para um tipo enum (só de literal solto). Isso fazia o INSERT em
-- profiles falhar com "column ... is of type papel_usuario but expression
-- is of type text", que o Supabase Auth mostra como o genérico
-- "Database error saving new user" em todo cadastro novo.
-- =============================================================================

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
    case when v_eh_primeiro then 'admin'::papel_usuario else 'usuario'::papel_usuario end,
    case when v_eh_primeiro then 'aprovado'::status_conta else 'pendente'::status_conta end
  );
  return new;
end;
$$;

create or replace function public.garantir_meu_perfil()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_nome text;
  v_perfil public.profiles;
  v_eh_primeiro boolean;
begin
  if v_user_id is null then
    raise exception 'Não autenticado';
  end if;

  select * into v_perfil from public.profiles where id = v_user_id;
  if found then
    return v_perfil;
  end if;

  select email, coalesce(raw_user_meta_data ->> 'nome', email)
    into v_email, v_nome
    from auth.users
    where id = v_user_id;

  select not exists (select 1 from public.profiles) into v_eh_primeiro;

  insert into public.profiles (id, nome, email, role, status_conta)
  values (
    v_user_id,
    v_nome,
    v_email,
    case when v_eh_primeiro then 'admin'::papel_usuario else 'usuario'::papel_usuario end,
    case when v_eh_primeiro then 'aprovado'::status_conta else 'pendente'::status_conta end
  )
  returning * into v_perfil;

  return v_perfil;
end;
$$;

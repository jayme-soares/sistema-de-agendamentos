-- =============================================================================
-- 0005_garantir_perfil.sql
-- Autocorreção: se por qualquer motivo um usuário autenticado não tiver uma
-- linha em public.profiles (ex.: a trigger não rodou, ou o perfil foi
-- apagado manualmente), essa função cria o perfil na hora em vez de deixar
-- o usuário sem acesso e sem saída (o app chama isso sempre que precisa ler
-- o perfil do usuário logado).
-- =============================================================================

create function public.garantir_meu_perfil()
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
    case when v_eh_primeiro then 'admin' else 'usuario' end,
    case when v_eh_primeiro then 'aprovado' else 'pendente' end
  )
  returning * into v_perfil;

  return v_perfil;
end;
$$;

grant execute on function public.garantir_meu_perfil() to authenticated;

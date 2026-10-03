-- Exclusão protegida de projeto: exige o nome exato e remove tarefas na mesma transação.
create or replace function public.delete_project_with_tasks(
  p_project_id uuid,
  p_project_name text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_project public.projects%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  select *
  into target_project
  from public.projects
  where id = p_project_id;

  if not found then
    raise exception 'Projeto não encontrado ou sem permissão';
  end if;

  if not public.is_workspace_member(target_project.workspace_id) then
    raise exception 'Você não tem permissão para excluir este projeto';
  end if;

  if p_project_name is distinct from target_project.name then
    raise exception 'O nome do projeto não confere';
  end if;

  delete from public.tasks
  where project_id = target_project.id
    and workspace_id = target_project.workspace_id;

  delete from public.projects
  where id = target_project.id
    and workspace_id = target_project.workspace_id;

  if not found then
    raise exception 'Não foi possível excluir o projeto';
  end if;
end;
$$;

revoke all on function public.delete_project_with_tasks(uuid, text) from public;
revoke all on function public.delete_project_with_tasks(uuid, text) from anon;
grant execute on function public.delete_project_with_tasks(uuid, text) to authenticated;

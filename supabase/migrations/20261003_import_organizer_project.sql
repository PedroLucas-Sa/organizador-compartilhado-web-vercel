-- Importa um arquivo organizador-project v1 em uma única transação.
-- O workspace e o usuário são obtidos da sessão autenticada; IDs externos não são aceitos.

create or replace function public.import_organizer_project(
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_workspace uuid;
  project_id uuid;
  project_name text;
  project_description text;
  project_tasks jsonb;
  task_data jsonb;
  task_title text;
  task_description text;
  task_priority text;
  task_status text;
  task_due_text text;
  task_due_date date;
  task_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select wm.workspace_id
  into target_workspace
  from public.workspace_members wm
  where wm.user_id = current_user_id
  order by wm.created_at
  limit 1;

  if target_workspace is null then
    raise exception 'Você ainda não pertence a um workspace';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Arquivo de projeto inválido';
  end if;

  if p_payload ->> 'format' is distinct from 'organizador-project' then
    raise exception 'Formato de arquivo inválido';
  end if;

  if p_payload ->> 'version' is distinct from '1' then
    raise exception 'Versão de arquivo não suportada';
  end if;

  if jsonb_typeof(p_payload -> 'project') is distinct from 'object' then
    raise exception 'O campo project é obrigatório';
  end if;

  if jsonb_typeof(p_payload #> '{project,name}') is distinct from 'string' then
    raise exception 'O projeto precisa ter um nome';
  end if;

  project_name := trim(p_payload #>> '{project,name}');
  if project_name = '' then
    raise exception 'O projeto precisa ter um nome';
  end if;

  if char_length(project_name) > 200 then
    raise exception 'O nome do projeto é muito longo';
  end if;

  if p_payload #> '{project,description}' is not null
     and p_payload #> '{project,description}' <> 'null'::jsonb
     and jsonb_typeof(p_payload #> '{project,description}') <> 'string' then
    raise exception 'A descrição do projeto precisa ser texto';
  end if;

  project_description := nullif(trim(coalesce(p_payload #>> '{project,description}', '')), '');
  project_tasks := coalesce(p_payload #> '{project,tasks}', '[]'::jsonb);

  if jsonb_typeof(project_tasks) is distinct from 'array' then
    raise exception 'O campo tasks precisa ser uma lista';
  end if;

  if jsonb_array_length(project_tasks) > 500 then
    raise exception 'Um arquivo pode importar no máximo 500 tarefas';
  end if;

  if exists (
    select 1
    from public.projects p
    where p.workspace_id = target_workspace
      and lower(trim(p.name)) = lower(project_name)
  ) then
    raise exception 'Já existe um projeto chamado "%" neste workspace', project_name;
  end if;

  insert into public.projects (workspace_id, name, description)
  values (target_workspace, project_name, project_description)
  returning id into project_id;

  for task_data in
    select value from jsonb_array_elements(project_tasks) as item(value)
  loop
    if jsonb_typeof(task_data) is distinct from 'object' then
      raise exception 'Uma das tarefas do arquivo é inválida';
    end if;

    if jsonb_typeof(task_data -> 'title') is distinct from 'string' then
      raise exception 'Todas as tarefas precisam ter um título';
    end if;

    task_title := trim(task_data ->> 'title');
    if task_title = '' then
      raise exception 'Todas as tarefas precisam ter um título';
    end if;

    if char_length(task_title) > 300 then
      raise exception 'O título de uma tarefa é muito longo';
    end if;

    if task_data -> 'description' is not null
       and task_data -> 'description' <> 'null'::jsonb
       and jsonb_typeof(task_data -> 'description') <> 'string' then
      raise exception 'A descrição das tarefas precisa ser texto';
    end if;

    task_description := nullif(trim(coalesce(task_data ->> 'description', '')), '');
    task_priority := coalesce(nullif(trim(task_data ->> 'priority'), ''), 'medium');
    task_status := coalesce(nullif(trim(task_data ->> 'status'), ''), 'pending');

    if task_priority not in ('low', 'medium', 'high') then
      raise exception 'Prioridade inválida na tarefa "%"', task_title;
    end if;

    if task_status not in ('pending', 'in_progress', 'done') then
      raise exception 'Status inválido na tarefa "%"', task_title;
    end if;

    if task_data -> 'due_date' is not null
       and task_data -> 'due_date' <> 'null'::jsonb
       and jsonb_typeof(task_data -> 'due_date') <> 'string' then
      raise exception 'O prazo da tarefa "%" precisa ser texto no formato AAAA-MM-DD', task_title;
    end if;

    task_due_text := nullif(trim(coalesce(task_data ->> 'due_date', '')), '');
    task_due_date := null;

    if task_due_text is not null then
      if task_due_text !~ '^\d{4}-\d{2}-\d{2}$' then
        raise exception 'Prazo inválido na tarefa "%": use AAAA-MM-DD', task_title;
      end if;

      begin
        task_due_date := task_due_text::date;
      exception when others then
        raise exception 'Prazo inválido na tarefa "%": use uma data real', task_title;
      end;
    end if;

    insert into public.tasks (
      workspace_id,
      project_id,
      title,
      description,
      priority,
      status,
      due_date,
      created_by
    ) values (
      target_workspace,
      project_id,
      task_title,
      task_description,
      task_priority,
      task_status,
      task_due_date,
      current_user_id
    );

    task_count := task_count + 1;
  end loop;

  return jsonb_build_object(
    'project_id', project_id,
    'project_name', project_name,
    'tasks_imported', task_count
  );
end;
$$;

revoke all
on function public.import_organizer_project(jsonb)
from public;

grant execute
on function public.import_organizer_project(jsonb)
to authenticated;

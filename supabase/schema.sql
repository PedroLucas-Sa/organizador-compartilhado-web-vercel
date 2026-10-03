-- Organizador Compartilhado: schema + autenticação por Nome.ID + agenda em tempo real
-- Execute no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Meu espaço compartilhado',
  invite_code text unique not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'pending' check (status in ('pending','in_progress','done')),
  due_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_minute integer not null check (start_minute between 0 and 1439),
  end_minute integer not null check (end_minute between 1 and 1440),
  title text not null,
  owner_id uuid references auth.users(id) on delete set null,
  linked_task_id uuid references public.tasks(id) on delete set null,
  notes text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_minute > start_minute)
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  type text not null default 'help' check (type in ('help','review','planning')),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  help_request_id uuid references public.help_requests(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists schedule_blocks_workspace_day_idx on public.schedule_blocks(workspace_id, day_of_week);
create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists schedule_blocks_set_updated_at on public.schedule_blocks;
create trigger schedule_blocks_set_updated_at
before update on public.schedule_blocks
for each row execute function public.set_updated_at();

drop trigger if exists help_requests_set_updated_at on public.help_requests;
create trigger help_requests_set_updated_at
before update on public.help_requests
for each row execute function public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;

create or replace function public.get_my_workspace_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select wm.workspace_id
  from public.workspace_members wm
  where wm.user_id = auth.uid()
  order by wm.created_at
  limit 1;
$$;

create or replace function public.setup_new_user(
  p_username text,
  p_display_name text,
  p_invite_code text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  target_workspace uuid;
  generated_code text;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  p_username := lower(trim(p_username));
  p_display_name := trim(p_display_name);

  if p_username !~ '^[a-z0-9]+[._-][a-z0-9._-]+$' then
    raise exception 'Nome.ID inválido';
  end if;

  if current_email <> (p_username || '@organizador.local') then
    raise exception 'Nome.ID não corresponde à identidade autenticada';
  end if;

  if p_display_name = '' then
    p_display_name := p_username;
  end if;

  insert into public.profiles (id, username, display_name)
  values (current_user_id, p_username, p_display_name)
  on conflict (id) do update
    set username = excluded.username,
        display_name = excluded.display_name;

  -- Torna retries do cadastro idempotentes: um usuário já configurado mantém seu workspace.
  select wm.workspace_id into target_workspace
  from public.workspace_members wm
  where wm.user_id = current_user_id
  order by wm.created_at
  limit 1;

  if target_workspace is not null then
    return json_build_object(
      'workspace_id', target_workspace,
      'invite_code', (select invite_code from public.workspaces where id = target_workspace)
    );
  end if;

  if coalesce(trim(p_invite_code), '') <> '' then
    select id into target_workspace
    from public.workspaces
    where invite_code = upper(trim(p_invite_code));

    if target_workspace is null then
      raise exception 'Código de convite não encontrado';
    end if;
  else
    generated_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    insert into public.workspaces (name, invite_code, created_by)
    values ('Meu espaço compartilhado', generated_code, current_user_id)
    returning id into target_workspace;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (
    target_workspace,
    current_user_id,
    case when exists (
      select 1 from public.workspaces w
      where w.id = target_workspace and w.created_by = current_user_id
    ) then 'owner' else 'member' end
  )
  on conflict (workspace_id, user_id) do nothing;

  return json_build_object(
    'workspace_id', target_workspace,
    'invite_code', (select invite_code from public.workspaces where id = target_workspace)
  );
end;
$$;

create or replace function public.join_workspace(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_workspace uuid;
  existing_workspace uuid;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select wm.workspace_id into existing_workspace
  from public.workspace_members wm
  where wm.user_id = current_user_id
  order by wm.created_at
  limit 1;

  if existing_workspace is not null then
    return existing_workspace;
  end if;

  select id into target_workspace
  from public.workspaces
  where invite_code = upper(trim(p_invite_code));

  if target_workspace is null then
    raise exception 'Código de convite não encontrado';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (target_workspace, current_user_id, 'member')
  on conflict (workspace_id, user_id) do nothing;

  return target_workspace;
end;
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.get_my_workspace_id() from public;
revoke all on function public.setup_new_user(text, text, text) from public;
revoke all on function public.join_workspace(text) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.get_my_workspace_id() to authenticated;
grant execute on function public.setup_new_user(text, text, text) to authenticated;
grant execute on function public.join_workspace(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.help_requests enable row level security;
alter table public.comments enable row level security;

-- Políticas recriadas de forma idempotente.
drop policy if exists "profile self" on public.profiles;
drop policy if exists "workspace members can read profiles" on public.profiles;
drop policy if exists "members can read workspaces" on public.workspaces;
drop policy if exists "members can read memberships" on public.workspace_members;
drop policy if exists "members can manage projects" on public.projects;
drop policy if exists "members can manage tasks" on public.tasks;
drop policy if exists "members can manage schedule" on public.schedule_blocks;
drop policy if exists "members can manage help" on public.help_requests;
drop policy if exists "members can manage comments" on public.comments;

create policy "profile self" on public.profiles
for all using (id = auth.uid()) with check (id = auth.uid());

create policy "workspace members can read profiles" on public.profiles
for select using (
  exists (
    select 1
    from public.workspace_members viewer
    join public.workspace_members target on target.workspace_id = viewer.workspace_id
    where viewer.user_id = auth.uid() and target.user_id = profiles.id
  )
);

create policy "members can read workspaces" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "members can read memberships" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "members can manage projects" on public.projects
for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "members can manage tasks" on public.tasks
for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "members can manage schedule" on public.schedule_blocks
for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "members can manage help" on public.help_requests
for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "members can manage comments" on public.comments
for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

-- Realtime: habilita alterações da agenda para os dois usuários do espaço.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'schedule_blocks'
  ) then
    execute 'alter publication supabase_realtime add table public.schedule_blocks';
  end if;
end;
$$;

-- Integridade e desempenho do gerenciador de projetos.
create index if not exists tasks_project_status_idx on public.tasks(project_id, status);
create index if not exists tasks_workspace_due_date_idx on public.tasks(workspace_id, due_date);
create index if not exists schedule_blocks_linked_task_idx on public.schedule_blocks(linked_task_id);
create index if not exists help_requests_workspace_status_idx on public.help_requests(workspace_id, status);

create or replace function public.validate_task_workspace_links()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p
    where p.id = new.project_id and p.workspace_id = new.workspace_id
  ) then
    raise exception 'O projeto da tarefa precisa pertencer ao mesmo workspace';
  end if;

  if new.assigned_to is not null and not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = new.workspace_id and wm.user_id = new.assigned_to
  ) then
    raise exception 'O responsável da tarefa precisa ser membro do workspace';
  end if;

  if tg_op = 'INSERT' and auth.uid() is not null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_validate_workspace_links on public.tasks;
create trigger tasks_validate_workspace_links
before insert or update on public.tasks
for each row execute function public.validate_task_workspace_links();

create or replace function public.validate_schedule_workspace_links()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.linked_task_id is not null and not exists (
    select 1 from public.tasks t
    where t.id = new.linked_task_id and t.workspace_id = new.workspace_id
  ) then
    raise exception 'A tarefa vinculada ao horário precisa pertencer ao mesmo workspace';
  end if;

  if new.owner_id is not null and not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = new.workspace_id and wm.user_id = new.owner_id
  ) then
    raise exception 'O responsável do horário precisa ser membro do workspace';
  end if;

  if tg_op = 'INSERT' and auth.uid() is not null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists schedule_validate_workspace_links on public.schedule_blocks;
create trigger schedule_validate_workspace_links
before insert or update on public.schedule_blocks
for each row execute function public.validate_schedule_workspace_links();

-- Realtime para colaboração no gerenciador e na agenda.
do $$
declare
  realtime_table text;
begin
  foreach realtime_table in array array['projects', 'tasks', 'schedule_blocks']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = realtime_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', realtime_table);
    end if;
  end loop;
end;
$$;

-- Integridade adicional para colaboração em produção.
create or replace function public.validate_help_request_workspace_links()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.task_id is not null and not exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.workspace_id = new.workspace_id
  ) then
    raise exception 'A tarefa do pedido de ajuda precisa pertencer ao mesmo workspace';
  end if;

  if tg_op = 'INSERT' and auth.uid() is not null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists help_requests_validate_workspace_links on public.help_requests;
create trigger help_requests_validate_workspace_links
before insert or update on public.help_requests
for each row execute function public.validate_help_request_workspace_links();

create or replace function public.validate_comment_workspace_links()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.task_id is not null and not exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.workspace_id = new.workspace_id
  ) then
    raise exception 'A tarefa do comentário precisa pertencer ao mesmo workspace';
  end if;

  if new.help_request_id is not null and not exists (
    select 1 from public.help_requests h
    where h.id = new.help_request_id and h.workspace_id = new.workspace_id
  ) then
    raise exception 'O pedido de ajuda do comentário precisa pertencer ao mesmo workspace';
  end if;

  if new.task_id is null and new.help_request_id is null then
    raise exception 'O comentário precisa estar ligado a uma tarefa ou pedido de ajuda';
  end if;

  if tg_op = 'INSERT' and auth.uid() is not null then
    new.author_id := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists comments_validate_workspace_links on public.comments;
create trigger comments_validate_workspace_links
before insert or update on public.comments
for each row execute function public.validate_comment_workspace_links();


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

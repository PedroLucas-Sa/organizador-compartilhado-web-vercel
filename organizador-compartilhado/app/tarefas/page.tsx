"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { formatDate, priorityLabel, statusLabel, type ProjectTask, type TaskStatus } from "@/lib/project";

type TaskWithProject = ProjectTask & { projects: { name: string } | null };

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(targetWorkspace?: string | null) {
    if (!supabase) return;
    const workspace = targetWorkspace ?? workspaceId;
    if (!workspace) return;
    const { data, error: tasksError } = await supabase
      .from("tasks")
      .select("id,project_id,title,description,priority,status,due_date,assigned_to,created_by,created_at,updated_at,projects(name)")
      .eq("workspace_id", workspace)
      .order("updated_at", { ascending: false });
    if (tasksError) setError(`Erro ao carregar tarefas: ${tasksError.message}`);
    else setTasks((data ?? []) as unknown as TaskWithProject[]);
  }

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: authData } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!authData.user) {
        window.location.href = "/login";
        return;
      }
      const { data: workspaceData, error: workspaceError } = await supabase.rpc("get_my_workspace_id");
      if (workspaceError) {
        setError(`Erro ao localizar seu espaço: ${workspaceError.message}`);
        setLoading(false);
        return;
      }
      const workspace = workspaceData as string | null;
      setWorkspaceId(workspace);
      if (workspace) await load(workspace);
      if (mounted) setLoading(false);
    }
    void bootstrap();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function updateStatus(taskId: string, status: TaskStatus) {
    if (!supabase) return;
    const { error: updateError } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    if (updateError) setError(`Não foi possível atualizar: ${updateError.message}`);
    else await load();
  }

  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || task.title.toLowerCase().includes(needle) || (task.projects?.name ?? "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  return (
    <AppShell active="tasks" footerLabel={`${tasks.length} tarefa(s)`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">EXECUÇÃO</p>
          <h1>Tarefas</h1>
          <p className="muted">Visão consolidada das tarefas de todos os projetos do workspace.</p>
        </div>
        <Link href="/projetos" className="button primary">Abrir projetos</Link>
      </header>

      {error && <div className="error-message page-error">{error}</div>}

      <section className="task-toolbar panel">
        <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefa ou projeto..." />
        <div className="filter-buttons">
          {(["all", "pending", "in_progress", "done"] as const).map((status) => (
            <button type="button" key={status} className={`filter-button ${statusFilter === status ? "active" : ""}`} onClick={() => setStatusFilter(status)}>
              {status === "all" ? "Todas" : statusLabel[status]}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="panel compact-empty">Carregando tarefas...</div>
      ) : filtered.length ? (
        <section className="panel global-task-list">
          {filtered.map((task) => (
            <article className="global-task-row" key={task.id}>
              <div className="global-task-main">
                <span className={`status-pill ${task.status}`}>{statusLabel[task.status]}</span>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.projects?.name ?? "Sem projeto"} · {priorityLabel[task.priority]} · {formatDate(task.due_date)}</p>
                </div>
              </div>
              <div className="global-task-actions">
                <select value={task.status} onChange={(event) => void updateStatus(task.id, event.target.value as TaskStatus)}>
                  <option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="done">Concluída</option>
                </select>
                {task.project_id && <Link className="button secondary compact-button" href={`/projetos/${task.project_id}`}>Abrir projeto</Link>}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="panel compact-empty"><b>Nenhuma tarefa encontrada.</b><span>Ajuste os filtros ou crie tarefas dentro de um projeto.</span></div>
      )}
    </AppShell>
  );
}

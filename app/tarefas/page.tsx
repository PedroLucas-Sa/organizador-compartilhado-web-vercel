"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import {
  formatDate,
  isOverdue,
  priorityLabel,
  sortProjectTasks,
  statusLabel,
  type ProjectTask,
  type TaskStatus,
} from "@/lib/project";

type TaskWithProject = ProjectTask & { projects: { name: string } | null };
type TaskViewFilter = "all" | "todo" | "overdue";

const taskFilters: Array<{ value: TaskViewFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "todo", label: "A fazer" },
  { value: "overdue", label: "Em atraso" },
];

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [taskFilter, setTaskFilter] = useState<TaskViewFilter>("all");
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
      .eq("workspace_id", workspace);
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

  useEffect(() => {
    if (!supabase || !workspaceId) return;
    const channel = supabase
      .channel(`tasks-page-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `workspace_id=eq.${workspaceId}` }, () => void load(workspaceId))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, workspaceId]);

  async function updateStatus(taskId: string, status: TaskStatus) {
    if (!supabase) return;
    const { error: updateError } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    if (updateError) setError(`Não foi possível atualizar: ${updateError.message}`);
    else await load();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matching = tasks.filter((task) => {
      const matchesFilter =
        taskFilter === "all" ||
        (taskFilter === "todo" && task.status !== "done") ||
        (taskFilter === "overdue" && isOverdue(task));

      const matchesQuery =
        !needle ||
        task.title.toLowerCase().includes(needle) ||
        (task.projects?.name ?? "").toLowerCase().includes(needle);

      return matchesFilter && matchesQuery;
    });

    return sortProjectTasks(matching);
  }, [tasks, taskFilter, query]);

  return (
    <AppShell active="tasks" footerLabel={`${tasks.length} tarefa(s)`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">EXECUÇÃO</p>
          <h1>Tarefas</h1>
          <p className="muted">Ordenadas automaticamente por prazo, prioridade e andamento.</p>
        </div>
        <Link href="/projetos" className="button primary">Abrir projetos</Link>
      </header>

      {error && <div className="error-message page-error">{error}</div>}

      <section className="task-toolbar panel">
        <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefa ou projeto..." />
        <div className="filter-buttons">
          {taskFilters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={`filter-button ${taskFilter === filter.value ? "active" : ""}`}
              onClick={() => setTaskFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="panel compact-empty">Carregando tarefas...</div>
      ) : filtered.length ? (
        <section className="panel global-task-list">
          {filtered.map((task) => {
            const overdue = isOverdue(task);
            return (
              <article className="global-task-row" key={task.id}>
                <div className="global-task-main">
                  <div className="task-status-stack">
                    {overdue && <span className="status-pill overdue">Em atraso</span>}
                    <span className={`status-pill ${task.status}`}>{statusLabel[task.status]}</span>
                  </div>
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.projects?.name ?? "Sem projeto"} · {priorityLabel[task.priority]} · {formatDate(task.due_date)}</p>
                  </div>
                </div>
                <div className="global-task-actions">
                  <select value={task.status} onChange={(event) => void updateStatus(task.id, event.target.value as TaskStatus)}>
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="done">Concluída</option>
                  </select>
                  {task.status !== "done" && (
                    <Link className="button secondary compact-button" href={`/horario?task=${task.id}`}>
                      Adicionar ao horário
                    </Link>
                  )}
                  {task.project_id && <Link className="button secondary compact-button" href={`/projetos/${task.project_id}`}>Abrir projeto</Link>}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="panel compact-empty"><b>Nenhuma tarefa encontrada.</b><span>Ajuste os filtros ou crie tarefas dentro de um projeto.</span></div>
      )}
    </AppShell>
  );
}

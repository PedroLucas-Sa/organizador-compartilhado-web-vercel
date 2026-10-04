"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { isOverdue, priorityLabel, projectIcon, projectProgress, statusLabel, type ProjectSummary, type ProjectTask } from "@/lib/project";

type HelpRequest = { id: string; type: "help" | "review" | "planning"; title: string; status: string };

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [displayName, setDisplayName] = useState("Usuário");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
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

      const targetWorkspace = workspaceData as string | null;
      setWorkspaceId(targetWorkspace);
      if (!targetWorkspace) {
        setLoading(false);
        return;
      }

      const [profileResult, projectsResult, tasksResult, helpResult, workspaceResult] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", authData.user.id).maybeSingle(),
        supabase
          .from("projects")
          .select("id,workspace_id,name,description,icon,created_at,tasks(id,status,due_date,priority,title)")
          .eq("workspace_id", targetWorkspace)
          .order("created_at", { ascending: false }),
        supabase
          .from("tasks")
          .select("id,project_id,title,description,priority,status,due_date,assigned_to,created_by,created_at,updated_at")
          .eq("workspace_id", targetWorkspace)
          .order("updated_at", { ascending: false }),
        supabase
          .from("help_requests")
          .select("id,type,title,status")
          .eq("workspace_id", targetWorkspace)
          .neq("status", "resolved")
          .order("updated_at", { ascending: false }),
        supabase.from("workspaces").select("invite_code").eq("id", targetWorkspace).maybeSingle(),
      ]);

      if (!mounted) return;
      if (profileResult.data?.display_name) setDisplayName(profileResult.data.display_name);
      if (projectsResult.error) setError(`Erro ao carregar projetos: ${projectsResult.error.message}`);
      else setProjects((projectsResult.data ?? []) as ProjectSummary[]);
      if (tasksResult.error) setError(`Erro ao carregar tarefas: ${tasksResult.error.message}`);
      else setTasks((tasksResult.data ?? []) as ProjectTask[]);
      if (!helpResult.error) setHelpRequests((helpResult.data ?? []) as HelpRequest[]);
      if (!workspaceResult.error) setInviteCode(workspaceResult.data?.invite_code ?? null);
      setLoading(false);
    }

    void load();
    return () => { mounted = false; };
  }, [supabase]);

  const today = todayIso();
  const totalTasks = tasks.length;
  const todayTasks = tasks.filter((task) => task.due_date === today && task.status !== "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const overdue = tasks.filter((task) => isOverdue(task)).length;
  const focusTasks = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const priorityWeight = { high: 0, medium: 1, low: 2 } as const;
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) return priorityWeight[a.priority] - priorityWeight[b.priority];
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      return a.due_date ? -1 : b.due_date ? 1 : 0;
    })
    .slice(0, 4);

  return (
    <AppShell active="home" footerLabel={workspaceId ? "Workspace conectado" : "Sem workspace"}>
      <header className="topbar">
        <div>
          <p className="eyebrow">PAINEL</p>
          <h1>Olá, {displayName}.</h1>
          <p className="muted">Projetos, tarefas e agenda agora refletem os dados reais do seu espaço compartilhado.</p>
        </div>
        <div className="top-actions">
          <Link href="/projetos" className="button primary">Gerenciar projetos</Link>
          <Link href="/horario" className="button secondary">Abrir horário</Link>
        </div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}
      {!supabase && <div className="error-message page-error">Configure o Supabase em <code>.env.local</code> para carregar os dados reais.</div>}

      <section className="stats-grid">
        <article className="stat-card"><span>{loading ? "—" : totalTasks}</span><small>Tarefas</small></article>
        <article className="stat-card"><span>{loading ? "—" : todayTasks}</span><small>Para hoje</small></article>
        <article className="stat-card"><span>{loading ? "—" : inProgress}</span><small>Em andamento</small></article>
        <article className="stat-card danger"><span>{loading ? "—" : overdue}</span><small>Atrasadas</small></article>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header"><h2>Tarefas em foco</h2><Link href="/tarefas" className="text-link">Ver todas</Link></div>
          {loading ? (
            <div className="compact-empty">Carregando tarefas...</div>
          ) : focusTasks.length ? (
            <div className="task-list">
              {focusTasks.map((task) => (
                <Link className="task-row task-row-link" href={task.project_id ? `/projetos/${task.project_id}` : "/tarefas"} key={task.id}>
                  <span className={`status-dot ${task.status}`} />
                  <div className="task-main"><strong>{task.title}</strong><small>{statusLabel[task.status]}{task.due_date ? ` · prazo ${task.due_date.split("-").reverse().join("/")}` : ""}</small></div>
                  <span className={`priority ${task.priority}`}>{priorityLabel[task.priority]}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="compact-empty">Nenhuma tarefa pendente. Crie tarefas dentro de um projeto.</div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header"><h2>Colaboração</h2><span className="badge-neutral">{helpRequests.length} abertos</span></div>
          {helpRequests.length ? helpRequests.slice(0, 3).map((request) => (
            <div className="help-card warning-soft" key={request.id}>
              <b>{request.type === "review" ? "Revisão" : request.type === "planning" ? "Planejamento" : "Pedido de ajuda"}</b>
              <span>{request.title}</span>
            </div>
          )) : <div className="compact-empty">Nenhum pedido de ajuda ou revisão em aberto.</div>}
        </section>
      </div>

      <section className="panel projects-panel">
        <div className="panel-header"><h2>Projetos</h2><Link href="/projetos" className="text-link">Gerenciar</Link></div>
        {loading ? (
          <div className="compact-empty">Carregando projetos...</div>
        ) : projects.length ? (
          <div className="projects-grid">
            {projects.slice(0, 6).map((project) => {
              const progress = projectProgress(project.tasks ?? []);
              const done = (project.tasks ?? []).filter((task) => task.status === "done").length;
              return (
                <Link className="project-card project-card-link" href={`/projetos/${project.id}`} key={project.id}>
                  <div className="project-title"><span>{projectIcon(project.name, project.icon)}</span><strong>{project.name}</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  <div className="project-meta"><span>{progress}% concluído</span><span>{done}/{project.tasks?.length ?? 0} tarefas</span></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="compact-empty">
            <b>Nenhum projeto ainda.</b>
            <span>Abra o gerenciador para criar um projeto ou importar os projetos migrados.</span>
            <Link href="/projetos" className="button primary">Abrir projetos</Link>
          </div>
        )}
      </section>

      {inviteCode && (
        <section className="invite-banner panel">
          <div><strong>Código para convidar</strong><span>{inviteCode}</span></div>
          <small>A outra pessoa pode informar este código no cadastro para entrar no mesmo workspace.</small>
        </section>
      )}
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { priorityLabel, statusLabel, type TaskPriority, type TaskStatus } from "@/lib/project";

type HelpType = "help" | "review" | "planning";
type HelpStatus = "open" | "in_progress" | "resolved";
type CollaborationTab = "requests" | "comments" | "mine";
type RequestView = "active" | "resolved";

type HelpRequest = {
  id: string;
  workspace_id: string;
  task_id: string | null;
  created_by: string;
  type: HelpType;
  title: string;
  description: string | null;
  status: HelpStatus;
  created_at: string;
  updated_at: string;
};

type CollaborationComment = {
  id: string;
  task_id: string | null;
  help_request_id: string | null;
  author_id: string;
  content: string;
  created_at: string;
};

type CollaborationTask = {
  id: string;
  project_id: string | null;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string | null;
};

type Project = { id: string; name: string; icon: string | null };
type Member = { id: string; display_name: string; username: string; role: string };
type ProfileRow = { id: string; display_name: string; username: string };

const requestTypeLabel: Record<HelpType, string> = {
  help: "Ajuda",
  review: "Revisão",
  planning: "Planejamento",
};

const requestTypeIcon: Record<HelpType, string> = {
  help: "🆘",
  review: "🔎",
  planning: "🧭",
};

const requestStatusLabel: Record<HelpStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDueDate(value: string | null) {
  if (!value) return "Sem prazo";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
}

export default function CollaborationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Usuário");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<CollaborationTask[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<CollaborationTab>("requests");
  const [requestView, setRequestView] = useState<RequestView>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [requestTaskId, setRequestTaskId] = useState("");
  const [requestType, setRequestType] = useState<HelpType>("help");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const loadWorkspaceData = useCallback(async (workspace: string) => {
    if (!supabase) return;

    const [requestsResult, commentsResult, tasksResult, projectsResult, membersResult] = await Promise.all([
      supabase
        .from("help_requests")
        .select("id,workspace_id,task_id,created_by,type,title,description,status,created_at,updated_at")
        .eq("workspace_id", workspace)
        .order("updated_at", { ascending: false }),
      supabase
        .from("comments")
        .select("id,task_id,help_request_id,author_id,content,created_at")
        .eq("workspace_id", workspace)
        .not("help_request_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(400),
      supabase
        .from("tasks")
        .select("id,project_id,title,priority,status,due_date,assigned_to")
        .eq("workspace_id", workspace)
        .order("updated_at", { ascending: false }),
      supabase
        .from("projects")
        .select("id,name,icon")
        .eq("workspace_id", workspace)
        .order("name"),
      supabase.from("workspace_members").select("user_id,role").eq("workspace_id", workspace),
    ]);

    if (requestsResult.error) setError(`Erro ao carregar pedidos: ${requestsResult.error.message}`);
    else setRequests((requestsResult.data ?? []) as HelpRequest[]);

    if (commentsResult.error) setError(`Erro ao carregar comentários: ${commentsResult.error.message}`);
    else setComments((commentsResult.data ?? []) as CollaborationComment[]);

    if (tasksResult.error) setError(`Erro ao carregar tarefas: ${tasksResult.error.message}`);
    else setTasks((tasksResult.data ?? []) as CollaborationTask[]);

    if (projectsResult.error) setError(`Erro ao carregar projetos: ${projectsResult.error.message}`);
    else setProjects((projectsResult.data ?? []) as Project[]);

    if (!membersResult.error && membersResult.data?.length) {
      const memberIds = membersResult.data.map((item) => item.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,display_name,username")
        .in("id", memberIds);

      if (!profilesError) {
        const rows = (profiles ?? []) as ProfileRow[];
        const profileMap = new Map(rows.map((profile) => [profile.id, profile]));
        setMembers(membersResult.data.map((item) => ({
          id: item.user_id,
          role: item.role,
          display_name: profileMap.get(item.user_id)?.display_name ?? "Usuário",
          username: profileMap.get(item.user_id)?.username ?? "",
        })));
      }
    }
  }, [supabase]);

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

      setUserId(authData.user.id);
      const [workspaceResult, profileResult] = await Promise.all([
        supabase.rpc("get_my_workspace_id"),
        supabase.from("profiles").select("display_name").eq("id", authData.user.id).maybeSingle(),
      ]);

      if (workspaceResult.error) {
        setError(`Erro ao localizar seu espaço: ${workspaceResult.error.message}`);
        setLoading(false);
        return;
      }

      const workspace = workspaceResult.data as string | null;
      setWorkspaceId(workspace);
      if (profileResult.data?.display_name) setDisplayName(profileResult.data.display_name);

      if (workspace) {
        await loadWorkspaceData(workspace);

        const queryTask = new URLSearchParams(window.location.search).get("task");
        if (queryTask) {
          setRequestTaskId(queryTask);
          setShowCreate(true);
          setTab("requests");
        }
      }

      if (mounted) setLoading(false);
    }

    void bootstrap();
    return () => { mounted = false; };
  }, [supabase, loadWorkspaceData]);

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const requestMap = useMemo(() => new Map(requests.map((request) => [request.id, request])), [requests]);

  const activeRequests = useMemo(() => requests.filter((request) => request.status !== "resolved"), [requests]);
  const resolvedRequests = useMemo(() => requests.filter((request) => request.status === "resolved"), [requests]);
  const visibleRequests = requestView === "active" ? activeRequests : resolvedRequests;
  const myTasks = useMemo(() => tasks.filter((task) => task.assigned_to === userId && task.status !== "done"), [tasks, userId]);
  const recentComments = useMemo(() => [...comments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 40), [comments]);

  function memberName(id: string | null) {
    if (!id) return "Usuário";
    return memberMap.get(id)?.display_name ?? "Usuário";
  }

  function taskHref(task: CollaborationTask | undefined) {
    if (!task) return "/tarefas";
    return task.project_id ? `/projetos/${task.project_id}` : "/tarefas";
  }

  function taskContext(taskId: string | null) {
    if (!taskId) return null;
    const task = taskMap.get(taskId);
    if (!task) return null;
    const project = task.project_id ? projectMap.get(task.project_id) : undefined;
    return { task, project };
  }

  async function refresh() {
    if (!workspaceId) return;
    setError("");
    await loadWorkspaceData(workspaceId);
  }

  async function createRequest(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !workspaceId || !userId || !requestTitle.trim()) return;

    setSaving(true);
    setError("");
    setNotice("");
    const { error: insertError } = await supabase.from("help_requests").insert({
      workspace_id: workspaceId,
      task_id: requestTaskId || null,
      created_by: userId,
      type: requestType,
      title: requestTitle.trim(),
      description: requestDescription.trim() || null,
      status: "open",
    });
    setSaving(false);

    if (insertError) {
      setError(`Não foi possível criar o pedido: ${insertError.message}`);
      return;
    }

    setRequestTitle("");
    setRequestDescription("");
    setRequestType("help");
    setRequestTaskId("");
    setShowCreate(false);
    setRequestView("active");
    setNotice("Pedido de colaboração criado.");
    await refresh();
  }

  async function changeRequestStatus(request: HelpRequest, status: HelpStatus) {
    if (!supabase || !workspaceId || !userId) return;
    setBusyRequestId(request.id);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase.from("help_requests").update({ status }).eq("id", request.id);
    if (updateError) {
      setError(`Não foi possível atualizar o pedido: ${updateError.message}`);
      setBusyRequestId(null);
      return;
    }

    const actionText = status === "in_progress"
      ? `${displayName} assumiu este pedido.`
      : status === "resolved"
        ? `${displayName} marcou este pedido como resolvido.`
        : `${displayName} reabriu este pedido.`;

    const { error: commentError } = await supabase.from("comments").insert({
      workspace_id: workspaceId,
      task_id: request.task_id,
      help_request_id: request.id,
      author_id: userId,
      content: actionText,
    });

    if (commentError) setError(`O status foi alterado, mas não foi possível registrar a ação: ${commentError.message}`);
    else setNotice(status === "resolved" ? "Pedido resolvido." : status === "in_progress" ? "Pedido assumido." : "Pedido reaberto.");

    setBusyRequestId(null);
    await refresh();
  }

  async function addComment(event: FormEvent, request: HelpRequest) {
    event.preventDefault();
    if (!supabase || !workspaceId || !userId) return;
    const content = commentDrafts[request.id]?.trim();
    if (!content) return;

    setBusyRequestId(request.id);
    setError("");
    const { error: insertError } = await supabase.from("comments").insert({
      workspace_id: workspaceId,
      task_id: request.task_id,
      help_request_id: request.id,
      author_id: userId,
      content,
    });

    if (insertError) setError(`Não foi possível adicionar o comentário: ${insertError.message}`);
    else {
      setCommentDrafts((current) => ({ ...current, [request.id]: "" }));
      await refresh();
    }
    setBusyRequestId(null);
  }

  if (loading) {
    return <AppShell active="collaboration"><div className="panel compact-empty">Carregando colaboração...</div></AppShell>;
  }

  return (
    <AppShell active="collaboration" footerLabel={workspaceId ? "Workspace conectado" : "Sem workspace"}>
      <header className="topbar">
        <div>
          <p className="eyebrow">COLABORAÇÃO</p>
          <h1>Trabalhem juntos nas tarefas.</h1>
          <p className="muted">Peça ajuda, solicite revisão, planeje em conjunto e mantenha a conversa ligada à tarefa certa.</p>
        </div>
        <div className="top-actions">
          <button className="button secondary" type="button" onClick={() => void refresh()}>Atualizar</button>
          <button className="button primary" type="button" onClick={() => { setShowCreate((value) => !value); setTab("requests"); }}>+ Novo pedido</button>
        </div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}
      {notice && <div className="collaboration-notice">{notice}</div>}

      <section className="collaboration-metrics">
        <article><b>{activeRequests.length}</b><span>Pedidos ativos</span></article>
        <article><b>{activeRequests.filter((request) => request.status === "in_progress").length}</b><span>Em andamento</span></article>
        <article><b>{myTasks.length}</b><span>Minhas tarefas abertas</span></article>
        <article><b>{comments.length}</b><span>Comentários</span></article>
      </section>

      <div className="collaboration-tabs" role="tablist" aria-label="Áreas de colaboração">
        <button className={`filter-button ${tab === "requests" ? "active" : ""}`} type="button" onClick={() => setTab("requests")}>Pedidos</button>
        <button className={`filter-button ${tab === "comments" ? "active" : ""}`} type="button" onClick={() => setTab("comments")}>Comentários</button>
        <button className={`filter-button ${tab === "mine" ? "active" : ""}`} type="button" onClick={() => setTab("mine")}>Minhas tarefas</button>
      </div>

      {showCreate && (
        <section className="panel collaboration-create-panel">
          <div className="panel-header">
            <div><h2>Novo pedido</h2><p className="muted">Você pode vincular o pedido a uma tarefa ou deixá-lo geral.</p></div>
            <button className="icon-button" type="button" aria-label="Fechar" onClick={() => setShowCreate(false)}>×</button>
          </div>
          <form className="collaboration-form" onSubmit={createRequest}>
            <label>Tipo<select value={requestType} onChange={(event) => setRequestType(event.target.value as HelpType)}>
              <option value="help">Ajuda</option><option value="review">Revisão</option><option value="planning">Planejamento</option>
            </select></label>
            <label className="wide-field">Tarefa<select value={requestTaskId} onChange={(event) => setRequestTaskId(event.target.value)}>
              <option value="">Pedido geral, sem tarefa</option>
              {tasks.filter((task) => task.status !== "done").map((task) => {
                const project = task.project_id ? projectMap.get(task.project_id) : undefined;
                return <option value={task.id} key={task.id}>{project ? `${project.name} — ` : ""}{task.title}</option>;
              })}
            </select></label>
            <label className="wide-field">Título<input value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} placeholder="Ex.: Revisar a derivação do espalhamento" required /></label>
            <label className="full-field">Descrição<textarea rows={4} value={requestDescription} onChange={(event) => setRequestDescription(event.target.value)} placeholder="Explique o que precisa de ajuda, qual parte deve ser revisada ou o que precisa ser planejado." /></label>
            <div className="collaboration-form-actions">
              <button className="button secondary" type="button" onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className="button primary" disabled={saving}>{saving ? "Criando..." : "Criar pedido"}</button>
            </div>
          </form>
        </section>
      )}

      {tab === "requests" && (
        <section className="panel collaboration-section">
          <div className="panel-header collaboration-section-header">
            <div><h2>Pedidos</h2><p className="muted">Acompanhe pedidos abertos, em andamento e resolvidos.</p></div>
            <div className="filter-buttons">
              <button className={`filter-button ${requestView === "active" ? "active" : ""}`} type="button" onClick={() => setRequestView("active")}>Ativos ({activeRequests.length})</button>
              <button className={`filter-button ${requestView === "resolved" ? "active" : ""}`} type="button" onClick={() => setRequestView("resolved")}>Resolvidos ({resolvedRequests.length})</button>
            </div>
          </div>

          {visibleRequests.length ? (
            <div className="collaboration-request-list">
              {visibleRequests.map((request) => {
                const context = taskContext(request.task_id);
                const requestComments = comments.filter((comment) => comment.help_request_id === request.id);
                return (
                  <article className={`collaboration-request-card status-${request.status}`} key={request.id}>
                    <div className="collaboration-request-heading">
                      <div className="collaboration-request-title">
                        <span className="collaboration-type-icon">{requestTypeIcon[request.type]}</span>
                        <div>
                          <div className="collaboration-label-row">
                            <span className={`collaboration-type type-${request.type}`}>{requestTypeLabel[request.type]}</span>
                            <span className={`collaboration-status ${request.status}`}>{requestStatusLabel[request.status]}</span>
                          </div>
                          <h3>{request.title}</h3>
                          <small>por {memberName(request.created_by)} · atualizado {formatTimestamp(request.updated_at)}</small>
                        </div>
                      </div>
                      <div className="collaboration-request-actions">
                        {request.status === "open" && <button className="button secondary compact-button" disabled={busyRequestId === request.id} type="button" onClick={() => void changeRequestStatus(request, "in_progress")}>Assumir</button>}
                        {request.status !== "resolved" && <button className="button primary compact-button" disabled={busyRequestId === request.id} type="button" onClick={() => void changeRequestStatus(request, "resolved")}>Resolver</button>}
                        {request.status === "resolved" && <button className="button secondary compact-button" disabled={busyRequestId === request.id} type="button" onClick={() => void changeRequestStatus(request, "open")}>Reabrir</button>}
                      </div>
                    </div>

                    {request.description && <p className="collaboration-description">{request.description}</p>}

                    {context && (
                      <Link className="collaboration-task-link" href={taskHref(context.task)}>
                        <span>{context.project?.icon ?? "📁"}</span>
                        <div><b>{context.task.title}</b><small>{context.project?.name ?? "Sem projeto"} · {statusLabel[context.task.status]} · {priorityLabel[context.task.priority]} · {formatDueDate(context.task.due_date)}</small></div>
                        <strong>Abrir tarefa →</strong>
                      </Link>
                    )}

                    <div className="collaboration-comments">
                      <div className="collaboration-comments-title"><b>Conversa</b><span>{requestComments.length} comentário{requestComments.length === 1 ? "" : "s"}</span></div>
                      {requestComments.length ? requestComments.map((comment) => (
                        <div className="collaboration-comment" key={comment.id}>
                          <div><b>{memberName(comment.author_id)}</b><small>{formatTimestamp(comment.created_at)}</small></div>
                          <p>{comment.content}</p>
                        </div>
                      )) : <p className="collaboration-empty-comment">Nenhum comentário ainda.</p>}

                      <form className="collaboration-comment-form" onSubmit={(event) => void addComment(event, request)}>
                        <input value={commentDrafts[request.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Escreva um comentário..." />
                        <button className="button secondary compact-button" disabled={busyRequestId === request.id || !(commentDrafts[request.id]?.trim())}>Enviar</button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="compact-empty">
              <b>{requestView === "active" ? "Nenhum pedido ativo." : "Nenhum pedido resolvido ainda."}</b>
              {requestView === "active" && <button className="button primary" type="button" onClick={() => setShowCreate(true)}>Criar primeiro pedido</button>}
            </div>
          )}
        </section>
      )}

      {tab === "comments" && (
        <section className="panel collaboration-section">
          <div className="panel-header"><div><h2>Comentários recentes</h2><p className="muted">Histórico das conversas ligadas aos pedidos de colaboração.</p></div></div>
          {recentComments.length ? (
            <div className="collaboration-feed">
              {recentComments.map((comment) => {
                const request = comment.help_request_id ? requestMap.get(comment.help_request_id) : undefined;
                return (
                  <button className="collaboration-feed-item" type="button" key={comment.id} onClick={() => { setTab("requests"); setRequestView(request?.status === "resolved" ? "resolved" : "active"); }}>
                    <span className="collaboration-avatar">{memberName(comment.author_id).slice(0, 1).toUpperCase()}</span>
                    <div><b>{memberName(comment.author_id)}</b><p>{comment.content}</p><small>{request ? `${requestTypeLabel[request.type]} · ${request.title} · ` : ""}{formatTimestamp(comment.created_at)}</small></div>
                  </button>
                );
              })}
            </div>
          ) : <div className="compact-empty">Nenhum comentário ainda.</div>}
        </section>
      )}

      {tab === "mine" && (
        <section className="panel collaboration-section">
          <div className="panel-header"><div><h2>Minhas tarefas</h2><p className="muted">Tarefas abertas atribuídas a você neste workspace.</p></div><span className="badge-neutral">{myTasks.length}</span></div>
          {myTasks.length ? (
            <div className="collaboration-my-tasks">
              {myTasks.map((task) => {
                const project = task.project_id ? projectMap.get(task.project_id) : undefined;
                return (
                  <article className="collaboration-my-task" key={task.id}>
                    <div><span className="collaboration-task-project-icon">{project?.icon ?? "📁"}</span><div><h3>{task.title}</h3><p>{project?.name ?? "Sem projeto"} · {statusLabel[task.status]} · {priorityLabel[task.priority]} · {formatDueDate(task.due_date)}</p></div></div>
                    <div className="collaboration-my-task-actions">
                      <Link className="button secondary compact-button" href={taskHref(task)}>Abrir</Link>
                      <button className="button primary compact-button" type="button" onClick={() => { setRequestTaskId(task.id); setRequestType("help"); setRequestTitle(""); setRequestDescription(""); setShowCreate(true); setTab("requests"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Pedir colaboração</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="compact-empty">Você não tem tarefas abertas atribuídas no momento.</div>}
        </section>
      )}
    </AppShell>
  );
}

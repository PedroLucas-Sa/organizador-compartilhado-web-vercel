"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import IconPicker from "@/components/IconPicker";
import { createClient } from "@/lib/supabase/client";
import { formatDate, priorityLabel, projectIcon, projectProgress, statusLabel, type ProjectTask, type TaskPriority, type TaskStatus } from "@/lib/project";

type Project = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

type Member = {
  id: string;
  display_name: string;
  username: string;
  role: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  username: string;
};

type ScheduleBlock = {
  id: string;
  day_of_week: number;
  start_minute: number;
  end_minute: number;
  title: string;
  linked_task_id: string | null;
  owner_id: string | null;
};

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("📁");
  const [editDescription, setEditDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);

  const loadProject = useCallback(async (workspace: string) => {
    if (!supabase || !projectId) return;

    const [projectResult, tasksResult, membersResult, scheduleResult] = await Promise.all([
      supabase.from("projects").select("id,workspace_id,name,description,icon,created_at").eq("id", projectId).eq("workspace_id", workspace).maybeSingle(),
      supabase
        .from("tasks")
        .select("id,project_id,title,description,priority,status,due_date,assigned_to,created_by,created_at,updated_at")
        .eq("workspace_id", workspace)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true }),
      supabase.from("workspace_members").select("user_id,role").eq("workspace_id", workspace),
      supabase
        .from("schedule_blocks")
        .select("id,day_of_week,start_minute,end_minute,title,linked_task_id,owner_id")
        .eq("workspace_id", workspace)
        .not("linked_task_id", "is", null)
        .order("day_of_week")
        .order("start_minute"),
    ]);

    if (projectResult.error) setError(`Erro ao carregar projeto: ${projectResult.error.message}`);
    else {
      const nextProject = projectResult.data as Project | null;
      setProject(nextProject);
      if (nextProject) {
        setEditName(nextProject.name);
        setEditIcon(projectIcon(nextProject.name, nextProject.icon));
        setEditDescription(nextProject.description ?? "");
      }
    }

    if (tasksResult.error) setError(`Erro ao carregar tarefas: ${tasksResult.error.message}`);
    else {
      const nextTasks = (tasksResult.data ?? []) as ProjectTask[];
      setTasks(nextTasks);
      const taskIds = new Set(nextTasks.map((task) => task.id));
      setSchedule(((scheduleResult.data ?? []) as ScheduleBlock[]).filter((block) => block.linked_task_id && taskIds.has(block.linked_task_id)));
    }

    if (!membersResult.error && membersResult.data?.length) {
      const memberIds = membersResult.data.map((item) => item.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id,display_name,username").in("id", memberIds);
      const profileRows = (profiles ?? []) as ProfileRow[];
      const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
      const nextMembers = membersResult.data.map((item) => ({
        id: item.user_id,
        role: item.role,
        display_name: profileMap.get(item.user_id)?.display_name ?? "Usuário",
        username: profileMap.get(item.user_id)?.username ?? "",
      }));
      setMembers(nextMembers);
    }
  }, [supabase, projectId]);

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
      const { data: workspaceData, error: workspaceError } = await supabase.rpc("get_my_workspace_id");
      if (workspaceError) {
        setError(`Erro ao localizar seu espaço: ${workspaceError.message}`);
        setLoading(false);
        return;
      }
      const workspace = workspaceData as string | null;
      setWorkspaceId(workspace);
      if (workspace) await loadProject(workspace);
      if (mounted) setLoading(false);
    }

    void bootstrap();
    return () => { mounted = false; };
  }, [supabase, loadProject]);

  useEffect(() => {
    if (!supabase || !workspaceId) return;
    const channel = supabase
      .channel(`project-detail-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `id=eq.${projectId}` }, () => void loadProject(workspaceId))
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `workspace_id=eq.${workspaceId}` }, () => void loadProject(workspaceId))
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule_blocks", filter: `workspace_id=eq.${workspaceId}` }, () => void loadProject(workspaceId))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, workspaceId, projectId, loadProject]);

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !project || !editName.trim()) return;
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("projects")
      .update({ name: editName.trim(), icon: editIcon, description: editDescription.trim() || null })
      .eq("id", project.id);
    setSaving(false);
    if (updateError) setError(`Não foi possível salvar o projeto: ${updateError.message}`);
    else {
      setNotice("Projeto atualizado.");
      await loadProject(project.workspace_id);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !workspaceId || !userId || !taskTitle.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    const { error: insertError } = await supabase.from("tasks").insert({
      workspace_id: workspaceId,
      project_id: projectId,
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      priority: taskPriority,
      status: "pending",
      due_date: taskDueDate || null,
      assigned_to: taskAssignee || null,
      created_by: userId,
    });
    setSaving(false);
    if (insertError) {
      setError(`Não foi possível criar a tarefa: ${insertError.message}`);
      return;
    }
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskAssignee("");
    setNotice("Tarefa criada.");
    if (workspaceId) await loadProject(workspaceId);
  }

  async function updateTask(id: string, patch: Partial<Pick<ProjectTask, "status" | "priority" | "assigned_to" | "due_date">>) {
    if (!supabase) return;
    setError("");
    const { error: updateError } = await supabase.from("tasks").update(patch).eq("id", id);
    if (updateError) setError(`Não foi possível atualizar a tarefa: ${updateError.message}`);
    else if (workspaceId) await loadProject(workspaceId);
  }

  async function saveTaskContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !editingTask || !editingTask.title.trim()) return;
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("tasks").update({
      title: editingTask.title.trim(),
      description: editingTask.description?.trim() || null,
    }).eq("id", editingTask.id);
    setSaving(false);
    if (updateError) {
      setError(`Não foi possível editar a tarefa: ${updateError.message}`);
      return;
    }
    setEditingTask(null);
    setNotice("Tarefa atualizada.");
    if (workspaceId) await loadProject(workspaceId);
  }

  async function deleteTask(task: ProjectTask) {
    if (!supabase || !window.confirm(`Excluir a tarefa “${task.title}”?`)) return;
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
    if (deleteError) setError(`Não foi possível excluir a tarefa: ${deleteError.message}`);
    else if (workspaceId) await loadProject(workspaceId);
  }

  async function deleteProject() {
    if (!supabase || !project || deletingProject) return;

    if (deleteProjectName !== project.name) {
      setError("Digite exatamente o nome do projeto para confirmar a exclusão.");
      return;
    }

    setDeletingProject(true);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabase.rpc("delete_project_with_tasks", {
      p_project_id: project.id,
      p_project_name: deleteProjectName,
    });

    if (deleteError) {
      setDeletingProject(false);
      setError(`Não foi possível excluir o projeto: ${deleteError.message}`);
      return;
    }

    router.push("/projetos");
    router.refresh();
  }

  const memberName = (id: string | null) => members.find((member) => member.id === id)?.display_name ?? "Sem responsável";
  const progress = projectProgress(tasks);
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;

  if (loading) {
    return <AppShell active="projects"><div className="panel compact-empty">Carregando projeto...</div></AppShell>;
  }

  if (!project) {
    return (
      <AppShell active="projects">
        <div className="panel compact-empty"><b>Projeto não encontrado.</b><span>Ele pode ter sido removido ou não pertencer ao seu workspace.</span><Link className="button secondary" href="/projetos">Voltar aos projetos</Link></div>
      </AppShell>
    );
  }

  return (
    <AppShell active="projects" footerLabel={`${tasks.length} tarefa(s)`}>
      <div className="breadcrumbs"><Link href="/projetos">Projetos</Link><span>/</span><strong>{project.name}</strong></div>
      <header className="project-detail-header">
        <div className="project-title-block">
          <span className="project-title-icon" aria-hidden="true">{projectIcon(project.name, project.icon)}</span>
          <div>
            <p className="eyebrow">PROJETO</p>
            <h1>{project.name}</h1>
            <p className="muted project-description">{project.description || "Sem descrição."}</p>
          </div>
        </div>
        <div className="project-progress-card">
          <div className="project-progress-number">{progress}%</div>
          <span>concluído</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <small>{doneCount} de {tasks.length} tarefas concluídas</small>
        </div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}
      {notice && <div className="success-message page-error">{notice}</div>}

      <section className="project-metrics">
        <article><b>{tasks.length}</b><span>Total</span></article>
        <article><b>{inProgressCount}</b><span>Em andamento</span></article>
        <article><b>{doneCount}</b><span>Concluídas</span></article>
        <article><b>{schedule.length}</b><span>Blocos agendados</span></article>
      </section>

      <div className="project-detail-grid">
        <div className="project-main-column">
          <section className="panel">
            <div className="panel-header"><div><h2>Tarefas</h2><p className="muted">Status, responsável, prioridade e prazo podem ser alterados diretamente.</p></div></div>
            {tasks.length ? (
              <div className="project-task-list">
                {tasks.map((task) => (
                  <article className={`project-task-card ${task.status === "done" ? "is-done" : ""}`} key={task.id}>
                    <div className="task-card-heading">
                      <div>
                        <span className={`status-pill ${task.status}`}>{statusLabel[task.status]}</span>
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                      </div>
                      <div className="task-card-actions">
                        <button className="button secondary compact-button" type="button" onClick={() => setEditingTask({ ...task })}>Editar</button>
                        <button className="icon-button danger-text" type="button" title="Excluir tarefa" onClick={() => void deleteTask(task)}>×</button>
                      </div>
                    </div>
                    <div className="task-controls">
                      <label>Status<select value={task.status} onChange={(event) => void updateTask(task.id, { status: event.target.value as TaskStatus })}>
                        <option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="done">Concluída</option>
                      </select></label>
                      <label>Prioridade<select value={task.priority} onChange={(event) => void updateTask(task.id, { priority: event.target.value as TaskPriority })}>
                        <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
                      </select></label>
                      <label>Responsável<select value={task.assigned_to ?? ""} onChange={(event) => void updateTask(task.id, { assigned_to: event.target.value || null })}>
                        <option value="">Sem responsável</option>{members.map((member) => <option value={member.id} key={member.id}>{member.display_name}</option>)}
                      </select></label>
                      <label>Prazo<input type="date" value={task.due_date ?? ""} onChange={(event) => void updateTask(task.id, { due_date: event.target.value || null })} /></label>
                    </div>
                    <div className="task-card-footer">
                      <span><b>{priorityLabel[task.priority]}</b> prioridade · {memberName(task.assigned_to)} · {formatDate(task.due_date)}</span>
                      <Link className="text-link" href={`/horario?task=${task.id}`}>Agendar tarefa →</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="compact-empty">Nenhuma tarefa neste projeto.</div>}
          </section>

          <section className="panel add-task-panel">
            <div className="panel-header"><div><h2>Adicionar tarefa</h2><p className="muted">A tarefa será contabilizada automaticamente no progresso do projeto.</p></div></div>
            <form className="task-create-form" onSubmit={addTask}>
              <label className="wide-field">Título<input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: Implementar MCTS" required /></label>
              <label className="wide-field">Descrição<textarea rows={3} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Contexto, critério de conclusão ou observações." /></label>
              <label>Prioridade<select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></label>
              <label>Prazo<input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></label>
              <label>Responsável<select value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)}><option value="">Sem responsável</option>{members.map((member) => <option value={member.id} key={member.id}>{member.display_name}</option>)}</select></label>
              <button className="button primary" disabled={saving}>{saving ? "Salvando..." : "+ Adicionar tarefa"}</button>
            </form>
          </section>
        </div>

        <aside className="project-side-column">
          <section className="panel">
            <div className="panel-header"><h2>Horários vinculados</h2><Link href="/horario" className="text-link">Abrir agenda</Link></div>
            {schedule.length ? (
              <div className="linked-schedule-list">
                {schedule.map((block) => {
                  const task = tasks.find((item) => item.id === block.linked_task_id);
                  return (
                    <div className="linked-schedule-item" key={block.id}>
                      <b>{block.title}</b>
                      <span>{days[block.day_of_week]} · {minutesToTime(block.start_minute)}–{minutesToTime(block.end_minute)}</span>
                      <small>{task?.title ?? "Tarefa"} · {memberName(block.owner_id)}</small>
                    </div>
                  );
                })}
              </div>
            ) : <div className="compact-empty small"><span>Nenhuma tarefa deste projeto foi agendada ainda.</span></div>}
          </section>

          <section className="panel project-settings-panel">
            <div className="panel-header"><h2>Detalhes do projeto</h2></div>
            <form className="project-settings-form" onSubmit={saveProject}>
              <IconPicker value={editIcon} onChange={setEditIcon} disabled={saving} />
              <label>Nome<input value={editName} onChange={(event) => setEditName(event.target.value)} /></label>
              <label>Descrição<textarea rows={7} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label>
              <button className="button secondary" disabled={saving}>{saving ? "Salvando..." : "Salvar detalhes"}</button>
            </form>

            <div className="danger-zone">
              <div>
                <b>Zona de perigo</b>
                <p>Exclui permanentemente este projeto e todas as tarefas vinculadas a ele.</p>
              </div>
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setDeleteProjectName("");
                  setError("");
                  setShowDeleteProject(true);
                }}
              >
                Excluir projeto
              </button>
            </div>
          </section>
        </aside>
      </div>

      {editingTask && (
        <div className="editor-overlay" onMouseDown={() => setEditingTask(null)}>
          <form className="editor-card" onSubmit={saveTaskContent} onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-header"><div><p className="eyebrow">EDITAR TAREFA</p><h2>{editingTask.title}</h2></div></div>
            <div className="project-settings-form">
              <label>Título<input value={editingTask.title} onChange={(event) => setEditingTask({ ...editingTask, title: event.target.value })} /></label>
              <label>Descrição<textarea rows={7} value={editingTask.description ?? ""} onChange={(event) => setEditingTask({ ...editingTask, description: event.target.value })} /></label>
            </div>
            <div className="editor-actions">
              <div className="editor-actions-right"><button type="button" className="button ghost" onClick={() => setEditingTask(null)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Salvando..." : "Salvar tarefa"}</button></div>
            </div>
          </form>
        </div>
      )}

      {showDeleteProject && (
        <div
          className="editor-overlay"
          onMouseDown={() => {
            if (!deletingProject) {
              setShowDeleteProject(false);
              setDeleteProjectName("");
            }
          }}
        >
          <div className="editor-card delete-project-card" onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <div>
                <p className="eyebrow danger-text">EXCLUIR PROJETO</p>
                <h2>Esta ação é permanente</h2>
              </div>
            </div>

            <div className="delete-project-content">
              <p>
                O projeto <strong>{project.name}</strong> e todas as suas <strong>{tasks.length} tarefa(s)</strong> serão excluídos permanentemente.
              </p>
              <p>Para confirmar, digite exatamente o nome abaixo:</p>
              <code className="delete-project-name">{project.name}</code>
              <label>
                Nome do projeto
                <input
                  value={deleteProjectName}
                  onChange={(event) => setDeleteProjectName(event.target.value)}
                  placeholder={project.name}
                  autoComplete="off"
                  autoFocus
                  disabled={deletingProject}
                />
              </label>
              <small className="muted">O nome diferencia maiúsculas, minúsculas e espaços.</small>
            </div>

            <div className="editor-actions">
              <button
                type="button"
                className="button secondary"
                disabled={deletingProject}
                onClick={() => {
                  setShowDeleteProject(false);
                  setDeleteProjectName("");
                }}
              >
                Cancelar
              </button>
              <div className="editor-actions-right">
                <button
                  type="button"
                  className="button ghost"
                  disabled={deletingProject || deleteProjectName !== project.name}
                  onClick={() => void deleteProject()}
                >
                  {deletingProject ? "Excluindo..." : "Excluir projeto e tarefas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

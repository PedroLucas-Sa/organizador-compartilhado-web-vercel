"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

type ScheduleRow = {
  id: string;
  workspace_id: string;
  day_of_week: number;
  start_minute: number;
  end_minute: number;
  title: string;
  owner_id: string | null;
  linked_task_id: string | null;
  notes: string | null;
  created_by: string;
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

type TaskOption = {
  id: string;
  title: string;
  project_id: string | null;
  status: string;
  projects: { name: string } | null;
};

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const startHour = 7;
const endHour = 22;
const rowMinutes = 30;
const rowHeight = 42;
const headerHeight = 58;

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function WeeklySchedule() {
  const supabase = useMemo(() => createClient(), []);
  const [requestedTask, setRequestedTask] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [blocks, setBlocks] = useState<ScheduleRow[]>([]);
  const [selected, setSelected] = useState<ScheduleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState(0);
  const [newStart, setNewStart] = useState(9 * 60);
  const [newEnd, setNewEnd] = useState(10 * 60);
  const [newOwner, setNewOwner] = useState("");
  const [newLinkedTask, setNewLinkedTask] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const timeRows = useMemo(
    () => Array.from({ length: ((endHour - startHour) * 60) / rowMinutes }, (_, index) => startHour * 60 + index * rowMinutes),
    [],
  );
  const timeOptions = useMemo(
    () => timeRows.concat(endHour * 60).map((minute) => ({ minute, label: minutesToTime(minute) })),
    [timeRows],
  );

  const loadWorkspaceData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setError("");
    const { data: workspaceData, error: workspaceError } = await supabase.rpc("get_my_workspace_id");
    if (workspaceError) {
      setError(`Erro ao localizar seu espaço: ${workspaceError.message}`);
      setLoading(false);
      return;
    }

    const workspace = workspaceData as string | null;
    setWorkspaceId(workspace);
    if (!workspace) {
      setBlocks([]);
      setMembers([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    const [scheduleResult, memberResult, taskResult] = await Promise.all([
      supabase
        .from("schedule_blocks")
        .select("id,workspace_id,day_of_week,start_minute,end_minute,title,owner_id,linked_task_id,notes,created_by")
        .eq("workspace_id", workspace)
        .order("day_of_week")
        .order("start_minute"),
      supabase.from("workspace_members").select("user_id,role").eq("workspace_id", workspace),
      supabase
        .from("tasks")
        .select("id,title,project_id,status,projects(name)")
        .eq("workspace_id", workspace)
        .order("title"),
    ]);

    if (scheduleResult.error) setError(`Erro ao carregar a agenda: ${scheduleResult.error.message}`);
    else setBlocks((scheduleResult.data ?? []) as ScheduleRow[]);

    if (taskResult.error) setError(`Erro ao carregar tarefas: ${taskResult.error.message}`);
    else setTasks((taskResult.data ?? []) as unknown as TaskOption[]);

    if (memberResult.error) {
      setError(`Erro ao carregar participantes: ${memberResult.error.message}`);
    } else if (memberResult.data?.length) {
      const ids = memberResult.data.map((item) => item.user_id);
      const { data: profiles, error: profileError } = await supabase.from("profiles").select("id,display_name,username").in("id", ids);
      if (profileError) setError(`Erro ao carregar nomes: ${profileError.message}`);
      else {
        const profileRows = (profiles ?? []) as ProfileRow[];
        const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
        const nextMembers = memberResult.data.map((item) => ({
          id: item.user_id,
          role: item.role,
          display_name: profileMap.get(item.user_id)?.display_name ?? "Usuário",
          username: profileMap.get(item.user_id)?.username ?? "",
        }));
        setMembers(nextMembers);
        setNewOwner((current) => current || nextMembers[0]?.id || "");
      }
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setRequestedTask(new URLSearchParams(window.location.search).get("task"));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUserId(data.user.id);
      await loadWorkspaceData();
    }
    void bootstrap();
    return () => { mounted = false; };
  }, [supabase, loadWorkspaceData]);

  useEffect(() => {
    if (!requestedTask || !tasks.length) return;
    const task = tasks.find((item) => item.id === requestedTask);
    if (!task) return;
    setNewLinkedTask(task.id);
    setNewTitle((current) => current || task.title);
  }, [requestedTask, tasks]);

  useEffect(() => {
    if (!supabase || !workspaceId) return;
    const channel = supabase
      .channel(`schedule-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule_blocks", filter: `workspace_id=eq.${workspaceId}` }, () => void loadWorkspaceData())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `workspace_id=eq.${workspaceId}` }, () => void loadWorkspaceData())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, workspaceId, loadWorkspaceData]);

  function resetNewForm() {
    setNewTitle("");
    setNewDay(0);
    setNewStart(9 * 60);
    setNewEnd(10 * 60);
    setNewOwner(members[0]?.id ?? "");
    setNewLinkedTask("");
    setNewNotes("");
  }

  function selectTaskForNewBlock(taskId: string) {
    setNewLinkedTask(taskId);
    const task = tasks.find((item) => item.id === taskId);
    if (task) setNewTitle((current) => current || task.title);
  }

  async function addBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !workspaceId || !userId) return;
    if (!newTitle.trim()) {
      setError("Digite o nome da atividade.");
      return;
    }
    if (newEnd <= newStart) {
      setError("O horário final precisa ser depois do horário inicial.");
      return;
    }

    setSaving(true);
    setError("");
    const { error: insertError } = await supabase.from("schedule_blocks").insert({
      workspace_id: workspaceId,
      day_of_week: newDay,
      start_minute: newStart,
      end_minute: newEnd,
      title: newTitle.trim(),
      owner_id: newOwner || userId,
      linked_task_id: newLinkedTask || null,
      notes: newNotes.trim() || null,
      created_by: userId,
    });
    setSaving(false);
    if (insertError) {
      setError(`Não foi possível adicionar o horário: ${insertError.message}`);
      return;
    }
    resetNewForm();
    await loadWorkspaceData();
  }

  async function saveSelected() {
    if (!supabase || !selected) return;
    if (selected.end_minute <= selected.start_minute) {
      setError("O horário final precisa ser depois do horário inicial.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("schedule_blocks").update({
      day_of_week: selected.day_of_week,
      start_minute: selected.start_minute,
      end_minute: selected.end_minute,
      title: selected.title.trim() || "Novo horário",
      owner_id: selected.owner_id,
      linked_task_id: selected.linked_task_id,
      notes: selected.notes?.trim() || null,
    }).eq("id", selected.id);
    setSaving(false);
    if (updateError) {
      setError(`Não foi possível salvar: ${updateError.message}`);
      return;
    }
    setSelected(null);
    await loadWorkspaceData();
  }

  async function deleteBlock(id: string) {
    if (!supabase) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from("schedule_blocks").delete().eq("id", id);
    setSaving(false);
    if (deleteError) {
      setError(`Não foi possível excluir: ${deleteError.message}`);
      return;
    }
    setSelected(null);
    await loadWorkspaceData();
  }

  async function splitBlock(block: ScheduleRow) {
    if (!supabase || !userId) return;
    const midpoint = Math.floor((block.start_minute + block.end_minute) / 2 / 30) * 30;
    if (midpoint <= block.start_minute || midpoint >= block.end_minute) {
      setError("Este bloco é curto demais para ser dividido em dois horários de 30 minutos.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: insertError } = await supabase.from("schedule_blocks").insert({
      workspace_id: block.workspace_id,
      day_of_week: block.day_of_week,
      start_minute: midpoint,
      end_minute: block.end_minute,
      title: `${block.title} (parte 2)`,
      owner_id: block.owner_id,
      linked_task_id: block.linked_task_id,
      notes: block.notes,
      created_by: userId,
    });
    if (!insertError) {
      const { error: updateError } = await supabase.from("schedule_blocks").update({ end_minute: midpoint, title: `${block.title} (parte 1)` }).eq("id", block.id);
      if (updateError) setError(`Não foi possível dividir: ${updateError.message}`);
    } else setError(`Não foi possível dividir: ${insertError.message}`);
    setSaving(false);
    setSelected(null);
    await loadWorkspaceData();
  }

  function blockPosition(block: ScheduleRow) {
    const top = ((block.start_minute - startHour * 60) / rowMinutes) * rowHeight + headerHeight;
    const height = ((block.end_minute - block.start_minute) / rowMinutes) * rowHeight - 6;
    return { top, height: Math.max(height, rowHeight - 6) };
  }

  const memberName = (id: string | null) => members.find((item) => item.id === id)?.display_name ?? "Sem responsável";
  const taskName = (id: string | null) => tasks.find((item) => item.id === id)?.title ?? null;

  if (!supabase) {
    return (
      <main className="auth-shell">
        <div className="auth-card wide">
          <div className="logo-mark">O</div>
          <p className="eyebrow">CONFIGURAÇÃO NECESSÁRIA</p>
          <h1>Conecte o Supabase</h1>
          <p className="muted">Copie o arquivo .env.example para .env.local e configure a URL e a publishable key do seu projeto Supabase.</p>
          <Link className="button primary full" href="/login">Voltar para o login</Link>
        </div>
      </main>
    );
  }

  return (
    <AppShell active="schedule" footerLabel={`${members.length || 1} participante(s)`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">PLANEJAMENTO COMPARTILHADO</p>
          <h1>Horário semanal</h1>
          <p className="muted">Blocos podem ser ligados a tarefas; o vínculo aparece também na página do projeto.</p>
        </div>
        <div className="legend">{members.map((member) => <span key={member.id}><i className="legend-dot blue" /> {member.display_name}</span>)}</div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}

      <section className="panel add-schedule-panel">
        <div className="panel-header"><div><h2>Novo horário</h2><p className="muted">Selecione uma tarefa para criar um vínculo rastreável com o projeto.</p></div></div>
        <form className="schedule-form enhanced-schedule-form" onSubmit={addBlock}>
          <label>Atividade<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Ex.: Implementar MCTS" /></label>
          <label>Tarefa vinculada<select value={newLinkedTask} onChange={(event) => selectTaskForNewBlock(event.target.value)}><option value="">Sem tarefa</option>{tasks.map((task) => <option value={task.id} key={task.id}>{task.projects?.name ? `${task.projects.name} · ` : ""}{task.title}{task.status === "done" ? " (concluída)" : ""}</option>)}</select></label>
          <label>Dia<select value={newDay} onChange={(event) => setNewDay(Number(event.target.value))}>{days.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
          <label>Início<select value={newStart} onChange={(event) => setNewStart(Number(event.target.value))}>{timeOptions.slice(0, -1).map((item) => <option value={item.minute} key={item.minute}>{item.label}</option>)}</select></label>
          <label>Fim<select value={newEnd} onChange={(event) => setNewEnd(Number(event.target.value))}>{timeOptions.slice(1).map((item) => <option value={item.minute} key={item.minute}>{item.label}</option>)}</select></label>
          <label>Responsável<select value={newOwner} onChange={(event) => setNewOwner(event.target.value)}>{members.map((member) => <option value={member.id} key={member.id}>{member.display_name}</option>)}</select></label>
          <label className="wide-field">Observação<input value={newNotes} onChange={(event) => setNewNotes(event.target.value)} placeholder="Opcional" /></label>
          <button className="button primary" disabled={saving}>+ Adicionar horário</button>
        </form>
      </section>


      <section className="schedule-panel panel">
        {loading ? <div className="empty-state">Carregando agenda compartilhada...</div> : !workspaceId ? (
          <div className="empty-state"><b>Este usuário ainda não possui um espaço.</b><Link className="button secondary" href="/cadastro">Ir para cadastro</Link></div>
        ) : (
          <div className="schedule-scroll">
            <div className="schedule-canvas" style={{ height: `${headerHeight + timeRows.length * rowHeight}px` }}>
              <div className="schedule-corner">HORÁRIO</div>
              {days.map((day, dayIndex) => <div className="day-header" key={day} style={{ left: `calc(78px + ${dayIndex} * ((100% - 78px) / 7))`, width: "calc((100% - 78px) / 7)" }}>{day}</div>)}
              {timeRows.map((minute) => <div className="time-line" key={minute} style={{ top: `${headerHeight + ((minute - startHour * 60) / rowMinutes) * rowHeight}px` }}><span>{minutesToTime(minute)}</span></div>)}
              {days.map((_, dayIndex) => <div className="day-column" key={dayIndex} style={{ left: `calc(78px + ${dayIndex} * ((100% - 78px) / 7))`, width: "calc((100% - 78px) / 7)" }} />)}
              {blocks.map((block) => {
                const position = blockPosition(block);
                const dayWidth = `(100% - 78px) / 7`;
                const ownerClass = block.owner_id === userId ? "blue" : "purple";
                return (
                  <button key={block.id} type="button" className={`schedule-block ${ownerClass}`} style={{ top: `${position.top}px`, height: `${position.height}px`, left: `calc(78px + ${block.day_of_week} * (${dayWidth}) + 5px)`, width: `calc(${dayWidth} - 10px)` }} onClick={() => setSelected(block)}>
                    <strong>{block.title}</strong>
                    <small>{minutesToTime(block.start_minute)} – {minutesToTime(block.end_minute)}</small>
                    <small>{memberName(block.owner_id)}</small>
                    {block.linked_task_id && <small>↳ {taskName(block.linked_task_id) ?? "Tarefa vinculada"}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {selected && (
        <div className="editor-overlay" onMouseDown={() => setSelected(null)}>
          <div className="editor-card" onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-header"><div><p className="eyebrow">EDITAR HORÁRIO</p><h2>{selected.title}</h2></div></div>
            <div className="schedule-form editor-form">
              <label>Atividade<input value={selected.title} onChange={(event) => setSelected({ ...selected, title: event.target.value })} /></label>
              <label>Tarefa vinculada<select value={selected.linked_task_id ?? ""} onChange={(event) => setSelected({ ...selected, linked_task_id: event.target.value || null })}><option value="">Sem tarefa</option>{tasks.map((task) => <option value={task.id} key={task.id}>{task.projects?.name ? `${task.projects.name} · ` : ""}{task.title}{task.status === "done" ? " (concluída)" : ""}</option>)}</select></label>
              <label>Dia<select value={selected.day_of_week} onChange={(event) => setSelected({ ...selected, day_of_week: Number(event.target.value) })}>{days.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
              <label>Início<select value={selected.start_minute} onChange={(event) => setSelected({ ...selected, start_minute: Number(event.target.value) })}>{timeOptions.slice(0, -1).map((item) => <option value={item.minute} key={item.minute}>{item.label}</option>)}</select></label>
              <label>Fim<select value={selected.end_minute} onChange={(event) => setSelected({ ...selected, end_minute: Number(event.target.value) })}>{timeOptions.slice(1).map((item) => <option value={item.minute} key={item.minute}>{item.label}</option>)}</select></label>
              <label>Responsável<select value={selected.owner_id ?? ""} onChange={(event) => setSelected({ ...selected, owner_id: event.target.value || null })}>{members.map((member) => <option value={member.id} key={member.id}>{member.display_name}</option>)}</select></label>
              <label className="wide-field">Observação<textarea rows={3} value={selected.notes ?? ""} onChange={(event) => setSelected({ ...selected, notes: event.target.value })} /></label>
            </div>
            <div className="editor-actions">
              <button className="button ghost" disabled={saving} onClick={() => void deleteBlock(selected.id)}>Excluir</button>
              <button className="button secondary" disabled={saving} onClick={() => void splitBlock(selected)}>Dividir horário</button>
              <div className="editor-actions-right"><button className="button ghost" onClick={() => setSelected(null)}>Cancelar</button><button className="button primary" disabled={saving} onClick={() => void saveSelected()}>{saving ? "Salvando..." : "Salvar"}</button></div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

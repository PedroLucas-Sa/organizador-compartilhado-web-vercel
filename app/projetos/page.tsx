"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { migratedProjects } from "@/data/migrated-projects";
import { createClient } from "@/lib/supabase/client";
import { projectIcon, projectProgress, type ProjectSummary } from "@/lib/project";

export default function ProjectsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProjects = useCallback(async (workspace: string) => {
    if (!supabase) return;

    const { data, error: projectsError } = await supabase
      .from("projects")
      .select("id,workspace_id,name,description,created_at,tasks(id,status,due_date,priority,title)")
      .eq("workspace_id", workspace)
      .order("created_at", { ascending: false });

    if (projectsError) setError(`Erro ao carregar projetos: ${projectsError.message}`);
    else setProjects((data ?? []) as ProjectSummary[]);
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

      const { data: workspaceData, error: workspaceError } = await supabase.rpc("get_my_workspace_id");
      if (workspaceError) {
        setError(`Erro ao localizar seu espaço: ${workspaceError.message}`);
        setLoading(false);
        return;
      }
      const workspace = workspaceData as string | null;
      setWorkspaceId(workspace);
      if (workspace) await loadProjects(workspace);
      if (mounted) setLoading(false);
    }

    void bootstrap();
    return () => { mounted = false; };
  }, [supabase, loadProjects]);

  useEffect(() => {
    if (!supabase || !workspaceId) return;
    const channel = supabase
      .channel(`projects-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `workspace_id=eq.${workspaceId}` }, () => void loadProjects(workspaceId))
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `workspace_id=eq.${workspaceId}` }, () => void loadProjects(workspaceId))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, workspaceId, loadProjects]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !workspaceId || !name.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");

    const { error: insertError } = await supabase.from("projects").insert({
      workspace_id: workspaceId,
      name: name.trim(),
      description: description.trim() || null,
    });

    setSaving(false);
    if (insertError) {
      setError(`Não foi possível criar o projeto: ${insertError.message}`);
      return;
    }
    setName("");
    setDescription("");
    setNotice("Projeto criado.");
    await loadProjects(workspaceId);
  }

  async function importMigratedProjects() {
    if (!supabase || !workspaceId || !userId) return;
    setImporting(true);
    setError("");
    setNotice("");

    const existing = new Set(projects.map((project) => project.name.trim().toLowerCase()));
    let importedCount = 0;
    let taskCount = 0;

    for (const seed of migratedProjects) {
      if (existing.has(seed.name.toLowerCase())) continue;

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({ workspace_id: workspaceId, name: seed.name, description: `${seed.description}\n\nOrigem da migração: ${seed.source}` })
        .select("id")
        .single();

      if (projectError || !project) {
        setError(`A importação parou em “${seed.name}”: ${projectError?.message ?? "projeto não retornado"}`);
        setImporting(false);
        await loadProjects(workspaceId);
        return;
      }

      if (seed.tasks.length) {
        const rows = seed.tasks.map((task) => ({
          workspace_id: workspaceId,
          project_id: project.id,
          title: task.title,
          description: task.description ?? null,
          priority: task.priority ?? "medium",
          status: "pending",
          created_by: userId,
        }));
        const { error: taskError } = await supabase.from("tasks").insert(rows);
        if (taskError) {
          setError(`O projeto “${seed.name}” foi criado, mas suas tarefas falharam: ${taskError.message}`);
          setImporting(false);
          await loadProjects(workspaceId);
          return;
        }
        taskCount += rows.length;
      }
      importedCount += 1;
      existing.add(seed.name.toLowerCase());
    }

    setImporting(false);
    setNotice(importedCount ? `${importedCount} projetos e ${taskCount} tarefas foram importados.` : "Todos os projetos migrados já existem neste workspace.");
    await loadProjects(workspaceId);
  }

  const filtered = projects.filter((project) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return project.name.toLowerCase().includes(needle) || (project.description ?? "").toLowerCase().includes(needle);
  });

  return (
    <AppShell active="projects" footerLabel={`${projects.length} projeto(s)`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Projetos</h1>
          <p className="muted">Cada cartão usa as tarefas reais para calcular o progresso automaticamente.</p>
        </div>
        <div className="top-actions">
          <button className="button secondary" disabled={importing || !workspaceId} onClick={() => void importMigratedProjects()}>
            {importing ? "Importando..." : "Importar migração"}
          </button>
        </div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}
      {notice && <div className="success-message page-error">{notice}</div>}
      {!supabase && <div className="error-message page-error">Configure o Supabase para usar o gerenciador.</div>}

      <section className="panel project-create-panel">
        <div className="panel-header"><div><h2>Novo projeto</h2><p className="muted">Crie a área de trabalho e adicione tarefas na página do projeto.</p></div></div>
        <form className="project-form" onSubmit={createProject}>
          <label>Nome<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Mini KataGo" required /></label>
          <label className="wide-field">Descrição<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Objetivo, contexto e critérios principais do projeto." /></label>
          <button className="button primary" disabled={saving || !workspaceId}>{saving ? "Criando..." : "+ Criar projeto"}</button>
        </form>
      </section>

      <section className="project-toolbar">
        <div>
          <h2>Projetos do workspace</h2>
          <span className="muted-inline">{projects.length} total</span>
        </div>
        <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar projeto..." />
      </section>

      {loading ? (
        <div className="panel compact-empty">Carregando projetos...</div>
      ) : !workspaceId ? (
        <div className="panel compact-empty"><b>Você ainda não está em um workspace.</b><Link className="button secondary" href="/cadastro">Criar ou entrar em um espaço</Link></div>
      ) : filtered.length ? (
        <div className="project-catalog">
          {filtered.map((project) => {
            const tasks = project.tasks ?? [];
            const progress = projectProgress(tasks);
            const done = tasks.filter((task) => task.status === "done").length;
            const active = tasks.filter((task) => task.status === "in_progress").length;
            return (
              <Link className="project-catalog-card" href={`/projetos/${project.id}`} key={project.id}>
                <div className="project-catalog-heading">
                  <span className="project-icon">{projectIcon(project.name)}</span>
                  <div><strong>{project.name}</strong><small>{project.description || "Sem descrição."}</small></div>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                <div className="project-catalog-stats">
                  <span><b>{progress}%</b> concluído</span>
                  <span>{done}/{tasks.length} concluídas</span>
                  <span>{active} em andamento</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel compact-empty"><b>Nenhum projeto encontrado.</b><span>Crie um projeto acima ou importe o pacote de migração.</span></div>
      )}
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import IconPicker from "@/components/IconPicker";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROJECT_ICON } from "@/data/project-icons";
import { projectIcon, projectProgress, type ProjectSummary } from "@/lib/project";

type ImportPriority = "low" | "medium" | "high";
type ImportStatus = "pending" | "in_progress" | "done";

type ImportTask = {
  title: string;
  description?: string | null;
  priority: ImportPriority;
  status: ImportStatus;
  due_date?: string | null;
};

type OrganizerProjectFile = {
  format: "organizador-project";
  version: 1;
  project: {
    name: string;
    icon: string;
    description?: string | null;
    tasks: ImportTask[];
  };
};

const priorityLabels: Record<ImportPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const statusLabels: Record<ImportStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseOrganizerProjectFile(raw: unknown): OrganizerProjectFile {
  if (!isPlainObject(raw)) throw new Error("O arquivo precisa conter um objeto JSON.");
  if (raw.format !== "organizador-project") throw new Error('O campo "format" precisa ser "organizador-project".');
  if (raw.version !== 1) throw new Error("Esta versão do Organizador aceita arquivos version: 1.");
  if (!isPlainObject(raw.project)) throw new Error('O campo "project" é obrigatório.');

  const projectName = typeof raw.project.name === "string" ? raw.project.name.trim() : "";
  if (!projectName) throw new Error("O projeto precisa ter um nome.");
  if (projectName.length > 200) throw new Error("O nome do projeto é muito longo.");

  const projectIconValue = raw.project.icon;
  if (projectIconValue != null && typeof projectIconValue !== "string") {
    throw new Error("O ícone do projeto precisa ser texto.");
  }
  const projectIcon = typeof projectIconValue === "string" && projectIconValue.trim()
    ? projectIconValue.trim()
    : DEFAULT_PROJECT_ICON;
  if (projectIcon.length > 32) throw new Error("O ícone do projeto é inválido.");

  const projectDescription = raw.project.description;
  if (projectDescription != null && typeof projectDescription !== "string") {
    throw new Error("A descrição do projeto precisa ser texto.");
  }

  if (!Array.isArray(raw.project.tasks)) throw new Error('O campo "tasks" precisa ser uma lista.');
  if (raw.project.tasks.length > 500) throw new Error("Um arquivo pode importar no máximo 500 tarefas.");

  const tasks = raw.project.tasks.map((item, index): ImportTask => {
    if (!isPlainObject(item)) throw new Error(`A tarefa ${index + 1} é inválida.`);

    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (!title) throw new Error(`A tarefa ${index + 1} precisa ter um título.`);
    if (title.length > 300) throw new Error(`O título da tarefa ${index + 1} é muito longo.`);

    if (item.description != null && typeof item.description !== "string") {
      throw new Error(`A descrição da tarefa ${index + 1} precisa ser texto.`);
    }

    const priority = item.priority ?? "medium";
    if (priority !== "low" && priority !== "medium" && priority !== "high") {
      throw new Error(`A prioridade da tarefa ${index + 1} precisa ser low, medium ou high.`);
    }

    const status = item.status ?? "pending";
    if (status !== "pending" && status !== "in_progress" && status !== "done") {
      throw new Error(`O status da tarefa ${index + 1} precisa ser pending, in_progress ou done.`);
    }

    let dueDate: string | null = null;
    if (item.due_date != null) {
      if (typeof item.due_date !== "string" || !isIsoDate(item.due_date)) {
        throw new Error(`O prazo da tarefa ${index + 1} precisa usar o formato AAAA-MM-DD.`);
      }
      dueDate = item.due_date;
    }

    return {
      title,
      description: typeof item.description === "string" ? item.description.trim() || null : null,
      priority,
      status,
      due_date: dueDate,
    };
  });

  return {
    format: "organizador-project",
    version: 1,
    project: {
      name: projectName,
      icon: projectIcon,
      description: typeof projectDescription === "string" ? projectDescription.trim() || null : null,
      tasks,
    },
  };
}

export default function ProjectsPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_PROJECT_ICON);
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<OrganizerProjectFile | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProjects = useCallback(async (workspace: string) => {
    if (!supabase) return;

    const { data, error: projectsError } = await supabase
      .from("projects")
      .select("id,workspace_id,name,description,icon,created_at,tasks(id,status,due_date,priority,title)")
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
      icon,
      description: description.trim() || null,
    });

    setSaving(false);
    if (insertError) {
      setError(`Não foi possível criar o projeto: ${insertError.message}`);
      return;
    }
    setName("");
    setIcon(DEFAULT_PROJECT_ICON);
    setDescription("");
    setNotice("Projeto criado.");
    await loadProjects(workspaceId);
  }

  async function chooseImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setNotice("");

    if (file.size > 1024 * 1024) {
      setError("O arquivo é maior que 1 MB.");
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const normalized = parseOrganizerProjectFile(parsed);
      setImportFileName(file.name);
      setImportPreview(normalized);
    } catch (fileError) {
      const message = fileError instanceof Error ? fileError.message : "Arquivo inválido.";
      setError(`Não foi possível abrir o projeto: ${message}`);
      setImportPreview(null);
      setImportFileName("");
    }
  }

  async function importProjectFile() {
    if (!supabase || !workspaceId || !importPreview) return;
    setImporting(true);
    setError("");
    setNotice("");

    const { data, error: importError } = await supabase.rpc("import_organizer_project", {
      p_payload: importPreview,
    });

    setImporting(false);
    if (importError) {
      setError(`Não foi possível importar o projeto: ${importError.message}`);
      return;
    }

    const result = data as { project_id?: string; tasks_imported?: number } | null;
    const taskCount = result?.tasks_imported ?? importPreview.project.tasks.length;
    const importedName = importPreview.project.name;
    setImportPreview(null);
    setImportFileName("");
    setNotice(`Projeto “${importedName}” importado com ${taskCount} tarefa(s).`);
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => void chooseImportFile(event)}
          />
          <button
            className="button secondary"
            disabled={importing || !workspaceId}
            onClick={() => fileInputRef.current?.click()}
          >
            Importar projeto
          </button>
        </div>
      </header>

      {error && <div className="error-message page-error">{error}</div>}
      {notice && <div className="success-message page-error">{notice}</div>}
      {!supabase && <div className="error-message page-error">Configure o Supabase para usar o gerenciador.</div>}

      <section className="panel project-create-panel">
        <div className="panel-header"><div><h2>Novo projeto</h2><p className="muted">Crie a área de trabalho e adicione tarefas na página do projeto.</p></div></div>
        <form className="project-form" onSubmit={createProject}>
          <IconPicker value={icon} onChange={setIcon} disabled={saving} />
          <label>Nome<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Mini KataGo" required /></label>
          <button className="button primary" disabled={saving || !workspaceId}>{saving ? "Criando..." : "+ Criar projeto"}</button>
          <label className="wide-field">Descrição<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Objetivo, contexto e critérios principais do projeto." /></label>
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
                  <span className="project-icon">{projectIcon(project.name, project.icon)}</span>
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
        <div className="panel compact-empty"><b>Nenhum projeto encontrado.</b><span>Crie um projeto acima ou importe um arquivo .organizador.json.</span></div>
      )}

      {importPreview && (
        <div
          className="editor-overlay"
          onMouseDown={() => {
            if (!importing) {
              setImportPreview(null);
              setImportFileName("");
            }
          }}
        >
          <div className="editor-card" onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">IMPORTAR PROJETO</p>
                <h2><span className="import-project-icon">{importPreview.project.icon}</span>{importPreview.project.name}</h2>
                <p className="muted">{importFileName || "Arquivo de projeto"}</p>
              </div>
            </div>

            <div style={{ padding: "0 20px 20px", display: "grid", gap: 16 }}>
              <div>
                <strong>{importPreview.project.tasks.length} tarefa(s) serão criadas</strong>
                <p className="muted" style={{ marginTop: 6 }}>
                  {importPreview.project.description || "Projeto sem descrição."}
                </p>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {importPreview.project.tasks.slice(0, 12).map((task, index) => (
                  <div
                    key={`${task.title}-${index}`}
                    style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", display: "grid", gap: 4 }}
                  >
                    <strong>{task.title}</strong>
                    <small className="muted">
                      {priorityLabels[task.priority]} · {statusLabels[task.status]}
                      {task.due_date ? ` · prazo ${task.due_date}` : ""}
                    </small>
                  </div>
                ))}
                {importPreview.project.tasks.length > 12 && (
                  <p className="muted">+ {importPreview.project.tasks.length - 12} tarefa(s) não exibidas na prévia.</p>
                )}
              </div>
            </div>

            <div className="editor-actions">
              <button
                type="button"
                className="button secondary"
                disabled={importing}
                onClick={() => {
                  setImportPreview(null);
                  setImportFileName("");
                }}
              >
                Cancelar
              </button>
              <div className="editor-actions-right">
                <button type="button" className="button primary" disabled={importing} onClick={() => void importProjectFile()}>
                  {importing ? "Importando..." : "Importar projeto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

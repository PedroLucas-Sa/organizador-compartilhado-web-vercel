export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type ProjectTask = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ProjectSummary = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  tasks: Pick<ProjectTask, "id" | "status" | "due_date" | "priority" | "title">[];
};

export const statusLabel: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
};

export const priorityLabel: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export function projectProgress(tasks: Array<{ status: string }>) {
  if (!tasks.length) return 0;
  const done = tasks.filter((task) => task.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export function formatDate(value: string | null) {
  if (!value) return "Sem prazo";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

export function isOverdue(task: { due_date: string | null; status: string }, today = new Date()) {
  if (!task.due_date || task.status === "done") return false;
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return task.due_date < localToday;
}

// Mantém compatibilidade com projetos antigos que ainda não tenham icon salvo.
export function projectIcon(name: string, icon?: string | null) {
  if (icon?.trim()) return icon.trim();

  const normalized = name.toLowerCase();
  if (normalized.includes("kata") || normalized.startsWith("ia ") || normalized.includes("inteligência artificial")) return "🧠";
  if (normalized.includes("nano") || normalized.includes("quím")) return "🧪";
  if (normalized.includes("program") || normalized.includes("automa")) return "💻";
  if (normalized.includes("ingl")) return "🌎";
  if (normalized.includes("bio")) return "🧬";
  if (normalized.includes("escrita") || normalized.includes("latex")) return "✍️";
  if (normalized.includes("jogo")) return "🎯";
  if (normalized.includes("frankenstein")) return "📚";
  return "📁";
}

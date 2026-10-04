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

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const statusOrder: Record<TaskStatus, number> = {
  in_progress: 0,
  pending: 1,
  done: 2,
};

type SortableTask = {
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  title?: string;
  updated_at?: string;
  created_at?: string;
};

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysUntilDueDate(dueDate: string, today: Date) {
  const [dueYear, dueMonth, dueDay] = dueDate.split("-").map(Number);
  const todayKey = localDateKey(today);
  const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);

  // Usa UTC apenas para calcular a distância entre datas de calendário,
  // evitando diferenças causadas por horário de verão/fuso horário.
  const dueUtc = Date.UTC(dueYear, dueMonth - 1, dueDay);
  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);
  return Math.floor((dueUtc - todayUtc) / 86_400_000);
}

function dueDateGroup(task: SortableTask, today: Date) {
  // 0 = prazo até 60 dias, 1 = sem prazo, 2 = prazo acima de 60 dias
  if (!task.due_date) return 1;
  return daysUntilDueDate(task.due_date, today) <= 60 ? 0 : 2;
}

/**
 * Ordem de exibição das tarefas:
 * 1. Tarefas não concluídas antes das concluídas.
 * 2. Em atraso antes das demais.
 * 3. Tarefas com prazo nos próximos 60 dias, pelo prazo mais próximo.
 * 4. Tarefas sem prazo.
 * 5. Tarefas com prazo a mais de 60 dias, pelo prazo mais próximo.
 * 6. Dentro do mesmo grupo: prioridade alta, média e baixa.
 * 7. Em andamento antes de pendente.
 * 8. Título como desempate estável.
 */
export function sortProjectTasks<T extends SortableTask>(tasks: T[], today = new Date()) {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "done";
    const bDone = b.status === "done";
    if (aDone !== bDone) return aDone ? 1 : -1;

    const aOverdue = isOverdue(a, today);
    const bOverdue = isOverdue(b, today);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    const aDueGroup = dueDateGroup(a, today);
    const bDueGroup = dueDateGroup(b, today);
    if (aDueGroup !== bDueGroup) return aDueGroup - bDueGroup;

    // Dentro dos grupos que possuem prazo, o mais próximo vem primeiro.
    if (a.due_date && b.due_date && a.due_date !== b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }

    const priorityDifference = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDifference !== 0) return priorityDifference;

    const statusDifference = statusOrder[a.status] - statusOrder[b.status];
    if (statusDifference !== 0) return statusDifference;

    return (a.title ?? "").localeCompare(b.title ?? "", "pt-BR");
  });
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

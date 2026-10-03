import Link from "next/link";
import type { ReactNode } from "react";

type Active = "home" | "tasks" | "projects" | "schedule";

type Props = {
  active: Active;
  children: ReactNode;
  footerLabel?: string;
};

const nav = [
  { key: "home", href: "/", icon: "🏠", label: "Início" },
  { key: "tasks", href: "/tarefas", icon: "📋", label: "Tarefas" },
  { key: "projects", href: "/projetos", icon: "📁", label: "Projetos" },
  { key: "schedule", href: "/horario", icon: "🕐", label: "Horário semanal" },
] as const;

export default function AppShell({ active, children, footerLabel = "Espaço compartilhado" }: Props) {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">ORGANIZADOR</div>
        <nav>
          {nav.map((item) => (
            <Link className={`nav-item ${active === item.key ? "active" : ""}`} href={item.href} key={item.key}>
              {item.icon} <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <form action="/auth/signout" method="post">
            <button className="nav-item nav-button" type="submit">↪ <span>Sair</span></button>
          </form>
          <div className="profile-chip">{footerLabel}</div>
        </div>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}

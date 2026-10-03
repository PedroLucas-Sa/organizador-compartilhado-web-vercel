import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organizador Compartilhado",
  description: "Projetos, tarefas e agenda compartilhados em um só lugar.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

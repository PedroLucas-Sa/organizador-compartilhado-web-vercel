"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export default function LoginPage() {
  const [nameId, setNameId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const username = normalizeId(nameId);
    if (!username || !password) {
      setError("Informe seu Nome.ID e sua senha.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      window.location.href = "/";
      return;
    }

    const syntheticEmail = `${username}@organizador.local`;
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });

    if (loginError) {
      setError("Não foi possível entrar. Confira o Nome.ID e a senha.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="logo-mark">O</div>
        <p className="eyebrow">ESPAÇO COMPARTILHADO</p>
        <h1>Entrar</h1>
        <p className="muted">Use seu Nome.ID para acessar seu organizador.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nome.ID<input value={nameId} onChange={(e) => setNameId(e.target.value)} placeholder="ex.: pedro.123" autoComplete="username" /></label>
          <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></label>
          {error && <div className="error-message">{error}</div>}
          <button className="button primary full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>

        <p className="auth-link"><Link href="/cadastro">Criar uma conta</Link></p>
      </div>
    </main>
  );
}

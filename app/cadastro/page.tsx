"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export default function CadastroPage() {
  const [displayName, setDisplayName] = useState("");
  const [nameId, setNameId] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const username = normalizeId(nameId);
    if (!username || !displayName.trim() || !password) {
      setError("Preencha nome, Nome.ID e senha.");
      setLoading(false);
      return;
    }
    if (!/^[a-z0-9]+[._-][a-z0-9._-]+$/.test(username)) {
      setError("Use um Nome.ID como pedro.123.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }

    const syntheticEmail = `${username}@organizador.local`;
    const { data, error: signUpError } = await supabase.auth.signUp({ email: syntheticEmail, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Ative a opção de não exigir confirmação de e-mail no Supabase para usar Nome.ID sem e-mail.");
      setLoading(false);
      return;
    }

    const { error: setupError } = await supabase.rpc("setup_new_user", {
      p_username: username,
      p_display_name: displayName.trim(),
      p_invite_code: inviteCode.trim() || null,
    });

    if (setupError) {
      setError(setupError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    window.setTimeout(() => { window.location.href = "/"; }, 800);
  }

  return (
    <main className="auth-shell">
      <div className="auth-card wide">
        <div className="logo-mark">O</div>
        <p className="eyebrow">ESPAÇO COMPARTILHADO</p>
        <h1>Criar conta</h1>
        <p className="muted">Sem convite, um novo espaço será criado. Com convite, você entra no espaço existente.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nome para exibição<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Pedro" autoComplete="name" /></label>
          <label>Nome.ID<input value={nameId} onChange={(e) => setNameId(e.target.value)} placeholder="pedro.123" autoComplete="username" /></label>
          <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo de 6 caracteres" autoComplete="new-password" /></label>
          <label>Código de convite <span className="optional">(opcional)</span><input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="K7P4X92L" /></label>
          {error && <div className="error-message">{error}</div>}
          {done && <div className="success-message">Conta criada. Entrando...</div>}
          <button className="button primary full" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
        </form>

        <p className="auth-link"><Link href="/login">Já tenho uma conta</Link></p>
      </div>
    </main>
  );
}

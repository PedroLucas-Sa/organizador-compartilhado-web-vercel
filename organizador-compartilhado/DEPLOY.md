# Deploy em produção — Vercel + Supabase

Este projeto foi preparado para rodar como aplicação web privada em **Next.js 16 + Supabase**, com deploy na **Vercel**.

## 1. Pré-requisitos

- Conta no Supabase.
- Conta na Vercel.
- Repositório Git (GitHub, GitLab ou Bitbucket) ou Vercel CLI.
- Node.js 24 para desenvolvimento local. O projeto fixa `node: 24.x` no `package.json` e inclui `.nvmrc`.

## 2. Criar/configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute `supabase/schema.sql` por completo.
3. Em **Authentication > Providers > Email**, mantenha login por senha habilitado.
4. Como o Organizador usa `Nome.ID` convertido internamente para `nome.id@organizador.local`, desative a confirmação obrigatória de e-mail. Esses endereços são identificadores internos e não caixas postais reais.
5. No painel do projeto, abra **Connect** e copie:
   - Project URL;
   - Publishable key (`sb_publishable_...`).
6. Em **Authentication > URL Configuration**, defina a Site URL para a URL final da aplicação quando ela estiver disponível. Para desenvolvimento, mantenha `http://localhost:3000` entre as URLs permitidas quando necessário.

O schema habilita RLS nas tabelas, valida vínculos entre workspaces e publica projetos, tarefas e agenda no Realtime.

## 3. Testar localmente

Copie o arquivo de exemplo e preencha as credenciais públicas do Supabase:

```bash
cp .env.example .env.local
npm install
npm run check:env
npm run dev
```

Abra `http://localhost:3000`.

Antes do deploy, rode:

```bash
npm run typecheck
npm run build
```

O `prebuild` chama automaticamente `npm run check:env`; portanto um deploy sem as duas variáveis obrigatórias falha cedo em vez de publicar uma aplicação sem banco.

## 4. Publicar pela Vercel

### Opção A — repositório Git

1. Envie o projeto para um repositório Git.
2. Na Vercel, use **Add New > Project** e importe o repositório.
3. A Vercel detectará Next.js automaticamente. Não altere Build Command nem Output Directory.
4. Em **Settings > Environment Variables**, adicione:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Essas duas variáveis são públicas por definição. Na interface atual da Vercel, podem ser cadastradas como **Config**; não coloque chaves secretas/service-role com prefixo `NEXT_PUBLIC_`.

5. Marque as variáveis para **Production**. Para Preview, prefira um projeto Supabase de teste; usar o mesmo banco de produção em previews permite que branches de teste alterem dados reais.
6. Faça o deploy.

### Opção B — Vercel CLI

Com a Vercel CLI instalada e autenticada:

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel --prod
```

## 5. Pós-deploy

Depois de receber a URL `https://...vercel.app`:

1. Atualize a **Site URL** no Supabase para essa URL.
2. Abra `/cadastro` e crie o primeiro usuário.
3. Confirme que ele recebe um workspace e um código de convite.
4. Abra `/projetos` e importe a migração.
5. Crie/edite uma tarefa e confirme que o progresso muda.
6. Use **Agendar tarefa** e confirme o vínculo em `/horario`.
7. Teste o botão **Sair** e entre novamente com `Nome.ID` + senha.
8. Em outro navegador ou janela anônima, crie o segundo usuário com o código de convite e confira o Realtime.

## 6. Domínio próprio (opcional)

Na Vercel, adicione o domínio em **Settings > Domains**. Depois que o DNS estiver ativo, troque a Site URL do Supabase para o domínio final e mantenha a URL `vercel.app` apenas se ainda for utilizada.

## 7. Segurança operacional

- Nunca adicione uma `secret key`/`service_role` ao frontend.
- Não comite `.env.local`; ele já está coberto pelo `.gitignore`.
- Mantenha RLS habilitado em todas as tabelas expostas pela Data API.
- Reaplique `supabase/schema.sql` quando esta versão do projeto for adotada, pois ele contém as políticas, funções, triggers e ajustes de integridade usados pelo código.
- Atualize dependências conscientemente. As versões estão fixadas para tornar builds reproduzíveis; atualizações de segurança devem ser feitas deliberadamente, com novo build e teste.

## 8. Configuração utilizada nesta versão

- Node.js: `24.x`
- Next.js: `16.3.8`
- React / React DOM: `19.3.0`
- `@supabase/ssr`: `0.12.7`
- `@supabase/supabase-js`: `2.117.2`


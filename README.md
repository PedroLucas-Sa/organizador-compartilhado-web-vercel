# Organizador Compartilhado

Organizador colaborativo em Next.js + Supabase para centralizar projetos, tarefas e planejamento semanal dentro de um workspace compartilhado.

## Recursos implementados

- Login com `Nome.ID` + senha usando Supabase Auth.
- Criação de workspace ou entrada por código de convite.
- Dashboard conectado aos dados reais do Supabase.
- Gerenciador de projetos em `/projetos`.
- Página individual em `/projetos/[id]` com descrição, tarefas, responsáveis, prioridades, prazos, progresso e horários vinculados.
- Progresso calculado automaticamente por `tarefas concluídas / tarefas totais`.
- Visão consolidada de tarefas em `/tarefas`.
- Agenda semanal colaborativa com criação, edição, divisão e exclusão de blocos.
- Vínculo entre `schedule_blocks.linked_task_id` e tarefas reais.
- Atalho “Agendar tarefa” no projeto, que abre `/horario?task=<id>` já com a tarefa selecionada.
- Importação dos projetos consolidados no pacote de migração diretamente pela página `/projetos`.
- Realtime para projetos, tarefas e agenda.
- RLS por workspace e triggers de integridade para impedir vínculos entre workspaces diferentes.

## Importação da migração

A página `/projetos` possui o botão **Importar migração**. Ele cria os projetos consolidados em `data/migrated-projects.ts` e transforma próximos passos/ações em tarefas pendentes. A importação é idempotente por nome do projeto: projetos com o mesmo nome não são recriados.

Os projetos incluídos são:

- IA e Mini-KataGo
- Nanopartículas e Química
- Programação e Automação Laboratorial
- Site Colaborativo de Organização
- Jogos e Estratégia
- Estudos de Ciências e Matemática
- Biologia Celular
- Escrita Científica e LaTeX/Typst
- Estudo de Inglês
- Literatura e Frankenstein

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql` completo. O arquivo é idempotente e pode ser reaplicado para incluir os novos índices, triggers e tabelas na publicação Realtime.
3. Em Authentication > Providers > Email, desative a confirmação obrigatória de e-mail caso queira usar apenas `Nome.ID` sem caixa de e-mail real.
4. Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

5. Crie uma conta em `/cadastro`. Sem código de convite, a conta cria um workspace; com código, entra no workspace existente.
6. Abra `/projetos` e use **Importar migração** para carregar os projetos consolidados.

## Estrutura principal

```text
app/
├── page.tsx                 # dashboard real
├── projetos/page.tsx        # catálogo + criação + importação
├── projetos/[id]/page.tsx   # gestão do projeto
├── tarefas/page.tsx         # visão consolidada
└── horario/page.tsx         # agenda compartilhada
components/
├── AppShell.tsx
└── WeeklySchedule.tsx
data/
└── migrated-projects.ts
lib/
├── project.ts
└── supabase/
supabase/
└── schema.sql
```

## Deploy na Vercel

O projeto está preparado para produção com Node.js 24, Next.js 16.3.8, dependências fixadas, validação das variáveis no build, proteção de rotas no `proxy.ts`, logout server-side e headers básicos de segurança.

O passo a passo completo está em [`DEPLOY.md`](./DEPLOY.md). Em resumo:

1. Aplique `supabase/schema.sql` no projeto Supabase.
2. Configure a publishable key e a Project URL.
3. Importe o repositório na Vercel.
4. Cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em Production.
5. Faça o deploy e execute o checklist pós-publicação de `DEPLOY.md`.

Para previews, prefira um Supabase separado do banco de produção.

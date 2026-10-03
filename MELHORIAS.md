# Avaliação e melhorias do Organizador Compartilhado

## Diagnóstico do projeto recebido

O banco já possuía a base correta para um gerenciador: `projects`, `tasks`, `schedule_blocks`, `help_requests`, `comments`, membros de workspace e RLS. O problema principal estava na aplicação: a home exibia projetos, tarefas, estatísticas e progresso definidos diretamente no código. Também existia `schedule_blocks.linked_task_id`, mas a agenda não lia nem gravava esse vínculo.

Outros pontos observados:

- os links de Projetos e Tarefas na navegação levavam de volta à home;
- não existiam `/projetos`, `/projetos/[id]` nem uma visão consolidada de tarefas;
- não havia criação/edição de projeto na interface;
- tarefas não podiam ter status, prioridade, responsável e prazo alterados pelo gerenciador;
- o progresso não era calculado com base em tarefas reais;
- projetos e tarefas não estavam habilitados explicitamente na publicação Realtime;
- as FKs simples permitiam, em nível estrutural, referências entre registros de workspaces diferentes se UUIDs fossem fornecidos manualmente.

## O que foi implementado

### Dashboard real

`app/page.tsx` agora consulta o workspace autenticado e calcula:

- total de tarefas;
- tarefas com prazo hoje;
- tarefas em andamento;
- tarefas atrasadas;
- tarefas em foco;
- pedidos de ajuda/revisão abertos;
- progresso real de cada projeto.

### Gerenciador de projetos

A rota `/projetos` agora possui:

- listagem real dos projetos do workspace;
- busca;
- criação de projeto;
- progresso por tarefas concluídas;
- contagem de tarefas concluídas e em andamento;
- importação dos projetos migrados.

### Página individual do projeto

A rota `/projetos/[id]` exibe e gerencia:

- nome e descrição;
- progresso;
- total/concluídas/em andamento;
- tarefas;
- status;
- prioridade;
- responsável;
- prazo;
- exclusão de tarefa;
- blocos da agenda relacionados às tarefas do projeto;
- atalho para agendar uma tarefa.

### Tarefas

A rota `/tarefas` oferece uma visão consolidada de todas as tarefas do workspace, com busca, filtros de status e atualização rápida do estado.

### Agenda ligada às tarefas

A agenda agora:

- carrega tarefas reais;
- permite selecionar `linked_task_id` ao criar ou editar um bloco;
- preserva o vínculo ao dividir um bloco;
- aceita `/horario?task=<uuid>` para abrir o formulário já associado à tarefa escolhida;
- mostra a tarefa vinculada no bloco da agenda.

### Migração

Os Markdown originais foram preservados em `migration/` e uma representação importável foi criada em `data/migrated-projects.ts`. A importação transforma ações e próximos passos em tarefas, mantendo o restante do conteúdo como contexto resumido na descrição do projeto.

### Banco

O `supabase/schema.sql` recebeu:

- índices para projeto/status, prazos e tarefas vinculadas à agenda;
- validação para impedir tarefa vinculada a projeto de outro workspace;
- validação para impedir responsável que não seja membro do workspace;
- validação para impedir horário ligado a tarefa de outro workspace;
- publicação Realtime para `projects`, `tasks` e `schedule_blocks`.

## Próxima evolução recomendada

A estrutura atual já fecha o fluxo projeto → tarefa → agenda. Os próximos incrementos de maior valor seriam edição completa do conteúdo textual da tarefa, comentários dentro da página do projeto, pedidos de ajuda associados às tarefas, histórico/auditoria de alterações e notificações de prazo. Depois disso, vale adicionar testes automatizados e tipos de banco gerados pelo Supabase para reduzir casts TypeScript.

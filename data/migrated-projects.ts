import type { TaskPriority } from "@/lib/project";

type SeedTask = {
  title: string;
  description?: string;
  priority?: TaskPriority;
};

type MigratedProject = {
  name: string;
  description: string;
  source: string;
  tasks: SeedTask[];
};

export const migratedProjects: MigratedProject[] = [
  {
    name: "IA e Mini-KataGo",
    source: "01_ia_mini_katago.md",
    description: "Estudar e desenvolver sistemas de IA para jogos de estratégia, com foco em redes neurais, busca, avaliação de posições e aprendizado. O Mini-KataGo funciona como projeto prático incremental para compreender a integração entre representação de estado, avaliador e mecanismo de busca.",
    tasks: [
      { title: "Estudar fundamentos de redes neurais aplicados ao jogo", priority: "high" },
      { title: "Fixar um jogo pequeno para prototipagem", priority: "high" },
      { title: "Implementar a representação numérica do estado", priority: "high" },
      { title: "Criar jogador aleatório e baseline simples", priority: "medium" },
      { title: "Definir arquitetura do avaliador / rede neural", priority: "high" },
      { title: "Implementar mecanismo de busca (ex.: MCTS)", priority: "high" },
      { title: "Experimentar aprendizado e autojogo", priority: "medium" },
      { title: "Comparar versões com métricas objetivas", priority: "medium" },
    ],
  },
  {
    name: "Nanopartículas e Química",
    source: "02_nanoparticulas_quimica.md",
    description: "Desenvolver e estudar nanopartículas de sílica e estruturas núcleo-casca para liberação gradual de nitrogênio, incluindo caracterização físico-química, mecanismo de incorporação e cinética de liberação.",
    tasks: [
      { title: "Definir composição da estrutura core-shell", priority: "high" },
      { title: "Definir método de incorporação da fonte de nitrogênio", priority: "high" },
      { title: "Planejar caracterização morfológica e de superfície", priority: "medium" },
      { title: "Definir ensaio de liberação e pontos de coleta", priority: "high" },
      { title: "Organizar referências por síntese, liberação e caracterização", priority: "medium" },
      { title: "Selecionar modelo cinético para análise dos dados", priority: "medium" },
    ],
  },
  {
    name: "Programação e Automação Laboratorial",
    source: "03_programacao_automacao.md",
    description: "Construir uma arquitetura de software para automação de experimentos laboratoriais com Python, FastAPI, WebSocket, máquina de estados, controle explícito de recursos e integração separada com serviços de LLM.",
    tasks: [
      { title: "Implementar FastAPI + WebSocket mínimo", priority: "high" },
      { title: "Criar experimento_1() com etapas sequenciais", priority: "high" },
      { title: "Criar máquina de estados simples", priority: "high" },
      { title: "Implementar controle de recursos e operações incompatíveis", priority: "high" },
      { title: "Adicionar logs, timeouts e tratamento de falhas", priority: "medium" },
      { title: "Integrar camada de LLM separadamente", priority: "medium" },
    ],
  },
  {
    name: "Site Colaborativo de Organização",
    source: "04_site_organizacao_colaborativa.md",
    description: "Criar um organizador colaborativo hospedado na Vercel, com autenticação, agenda semanal, dados compartilhados, edição pelos participantes e persistência segura no Supabase.",
    tasks: [
      { title: "Consolidar autenticação e modelo de permissões", priority: "high" },
      { title: "Conectar dashboard aos dados reais do Supabase", priority: "high" },
      { title: "Implementar gerenciador de projetos e tarefas", priority: "high" },
      { title: "Vincular tarefas aos blocos da agenda semanal", priority: "high" },
      { title: "Adicionar atualização em tempo real onde for útil", priority: "medium" },
      { title: "Preparar deploy e variáveis de ambiente na Vercel", priority: "medium" },
    ],
  },
  {
    name: "Jogos e Estratégia",
    source: "05_jogos_estrategia.md",
    description: "Estudar jogos de estratégia como Go, Shogi e Gamão, combinando análise de jogo, teoria de jogos, probabilidade, busca em árvores, simulação e desenvolvimento de agentes.",
    tasks: [
      { title: "Escolher um jogo para o próximo ciclo de estudo", priority: "high" },
      { title: "Separar estudo teórico, prática manual e implementação", priority: "medium" },
      { title: "Definir algoritmos a implementar do zero", priority: "medium" },
      { title: "Definir benchmarks para comparar agentes", priority: "medium" },
    ],
  },
  {
    name: "Estudos de Ciências e Matemática",
    source: "06_estudos_ciencias_matematica.md",
    description: "Centralizar estudos conceituais de matemática, física, química e áreas relacionadas, com foco em compreensão, interpretação física e autoavaliação estruturada.",
    tasks: [
      { title: "Organizar trilhas por disciplina", priority: "medium" },
      { title: "Registrar conceitos dominados e pontos de revisão", priority: "medium" },
      { title: "Criar exercícios graduais de cálculo vetorial", priority: "medium" },
      { title: "Revisar rotacional: definição, geometria e interpretação física", priority: "high" },
      { title: "Relacionar matemática, física e química quando houver conexão", priority: "low" },
    ],
  },
  {
    name: "Biologia Celular",
    source: "07_biologia_celular.md",
    description: "Estudar biologia celular por meio de perguntas, respostas próprias e análise crítica das afirmações científicas, incluindo figuras e legendas quando presentes.",
    tasks: [
      { title: "Definir temas prioritários de biologia celular", priority: "high" },
      { title: "Registrar erros conceituais recorrentes", priority: "medium" },
      { title: "Criar revisões periódicas", priority: "medium" },
      { title: "Relacionar conceitos celulares a bioquímica e genética", priority: "low" },
    ],
  },
  {
    name: "Escrita Científica e LaTeX/Typst",
    source: "08_escrita_cientifica.md",
    description: "Apoiar produção e revisão de textos científicos e relatórios, preservando significado experimental, distinguindo observação, interpretação, hipótese e conclusão e mantendo consistência documental.",
    tasks: [
      { title: "Definir padrão principal entre LaTeX e Typst", priority: "medium" },
      { title: "Definir estrutura padrão dos relatórios", priority: "high" },
      { title: "Definir padrão de referências bibliográficas", priority: "medium" },
      { title: "Padronizar nomenclatura de equipamentos e métodos", priority: "medium" },
    ],
  },
  {
    name: "Estudo de Inglês",
    source: "09_estudo_ingles.md",
    description: "Aprender inglês em contextos reais, com foco em naturalidade, precisão vocabular, estrutura frasal e distinção entre inglês cotidiano e acadêmico/científico.",
    tasks: [
      { title: "Criar registro de erros recorrentes", priority: "medium" },
      { title: "Separar trilhas de inglês geral e acadêmico", priority: "medium" },
      { title: "Criar exercícios de produção própria", priority: "medium" },
      { title: "Organizar vocabulário científico útil", priority: "low" },
    ],
  },
  {
    name: "Literatura e Frankenstein",
    source: "10_frankenstein.md",
    description: "Estudar Frankenstein, incluindo o filme de 1994 e sua relação com a obra de Mary Shelley, organizando temas como criação, responsabilidade, conhecimento, solidão, julgamento, vingança e humanidade.",
    tasks: [
      { title: "Registrar cenas específicas e interpretações", priority: "medium" },
      { title: "Comparar filme e livro", priority: "medium" },
      { title: "Organizar temas por personagem", priority: "low" },
      { title: "Separar análise narrativa de interpretação filosófica", priority: "medium" },
    ],
  },
];

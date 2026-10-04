export type ProjectIconCategory =
  | "Projetos e Organização"
  | "Matemática"
  | "Física e Astronomia"
  | "Química e Materiais"
  | "Computação e IA"
  | "Engenharia e Tecnologia"
  | "Pesquisa e Laboratório"
  | "Outros";

export type ProjectIconOption = {
  icon: string;
  label: string;
  category: ProjectIconCategory;
  keywords: string[];
};

export const DEFAULT_PROJECT_ICON = "📁";

export const PROJECT_ICON_CATEGORIES: ProjectIconCategory[] = [
  "Projetos e Organização",
  "Matemática",
  "Física e Astronomia",
  "Química e Materiais",
  "Computação e IA",
  "Engenharia e Tecnologia",
  "Pesquisa e Laboratório",
  "Outros",
];

export const PROJECT_ICONS: ProjectIconOption[] = [
  // Projetos e Organização
  { icon: "📁", label: "Projeto geral", category: "Projetos e Organização", keywords: ["projeto", "pasta", "geral"] },
  { icon: "🎯", label: "Objetivo", category: "Projetos e Organização", keywords: ["objetivo", "meta", "alvo"] },
  { icon: "📋", label: "Planejamento", category: "Projetos e Organização", keywords: ["planejamento", "tarefas", "checklist"] },
  { icon: "🗓️", label: "Cronograma", category: "Projetos e Organização", keywords: ["cronograma", "agenda", "calendário", "datas"] },
  { icon: "⏳", label: "Prazo", category: "Projetos e Organização", keywords: ["prazo", "deadline", "tempo"] },
  { icon: "🚀", label: "Desenvolvimento", category: "Projetos e Organização", keywords: ["desenvolvimento", "lançamento", "progresso"] },
  { icon: "💡", label: "Ideia", category: "Projetos e Organização", keywords: ["ideia", "insight", "conceito"] },
  { icon: "🧩", label: "Módulo", category: "Projetos e Organização", keywords: ["módulo", "parte", "componente", "integração"] },
  { icon: "📌", label: "Prioridade", category: "Projetos e Organização", keywords: ["prioridade", "importante", "fixar"] },
  { icon: "🔄", label: "Iteração", category: "Projetos e Organização", keywords: ["iteração", "ciclo", "revisão", "melhoria"] },
  { icon: "🏁", label: "Entrega", category: "Projetos e Organização", keywords: ["entrega", "final", "conclusão", "marco"] },
  { icon: "🛠️", label: "Implementação", category: "Projetos e Organização", keywords: ["implementação", "construção", "execução"] },
  { icon: "🗺️", label: "Roadmap", category: "Projetos e Organização", keywords: ["roadmap", "rota", "plano", "etapas"] },
  { icon: "📦", label: "Pacote ou entrega", category: "Projetos e Organização", keywords: ["pacote", "release", "entrega", "versão"] },
  { icon: "🔖", label: "Referência", category: "Projetos e Organização", keywords: ["referência", "marcador", "bookmark"] },
  { icon: "✅", label: "Concluído", category: "Projetos e Organização", keywords: ["concluído", "feito", "finalizado"] },

  // Matemática
  { icon: "🧮", label: "Matemática", category: "Matemática", keywords: ["matemática", "cálculo", "contas"] },
  { icon: "📐", label: "Geometria", category: "Matemática", keywords: ["geometria", "trigonometria", "ângulos"] },
  { icon: "📈", label: "EDO e dinâmica", category: "Matemática", keywords: ["edo", "equações diferenciais", "dinâmica", "sistemas dinâmicos"] },
  { icon: "📊", label: "Estatística", category: "Matemática", keywords: ["estatística", "dados", "inferência"] },
  { icon: "🎲", label: "Probabilidade", category: "Matemática", keywords: ["probabilidade", "aleatório", "variáveis aleatórias"] },
  { icon: "🧭", label: "Vetores", category: "Matemática", keywords: ["vetores", "cálculo vetorial", "direção", "campo vetorial"] },
  { icon: "∫", label: "Cálculo integral", category: "Matemática", keywords: ["integral", "integração", "cálculo"] },
  { icon: "∂", label: "Derivadas parciais", category: "Matemática", keywords: ["derivada", "parcial", "cálculo multivariável"] },
  { icon: "∇", label: "Gradiente", category: "Matemática", keywords: ["gradiente", "nabla", "divergente", "rotacional"] },
  { icon: "Σ", label: "Somatórios e séries", category: "Matemática", keywords: ["somatório", "séries", "sequências"] },
  { icon: "π", label: "Constantes", category: "Matemática", keywords: ["pi", "constantes", "círculo"] },
  { icon: "√", label: "Álgebra", category: "Matemática", keywords: ["álgebra", "raiz", "equações"] },
  { icon: "∞", label: "Limites", category: "Matemática", keywords: ["infinito", "limites", "análise"] },
  { icon: "λ", label: "Álgebra linear", category: "Matemática", keywords: ["lambda", "autovalor", "autovetor", "álgebra linear"] },
  { icon: "Δ", label: "Diferenças e variações", category: "Matemática", keywords: ["delta", "diferença", "variação", "discreto"] },
  { icon: "≈", label: "Métodos numéricos", category: "Matemática", keywords: ["aproximação", "numérico", "métodos numéricos"] },
  { icon: "≠", label: "Lógica e relações", category: "Matemática", keywords: ["lógica", "relações", "igualdade", "demonstração"] },
  { icon: "🔗", label: "Topologia", category: "Matemática", keywords: ["topologia", "conexão", "espaços", "continuidade"] },
  { icon: "🕸️", label: "Teoria dos grafos", category: "Matemática", keywords: ["grafos", "rede", "vértices", "arestas"] },

  // Física e Astronomia
  { icon: "⚛️", label: "Física quântica", category: "Física e Astronomia", keywords: ["física", "quântica", "átomo", "quantum"] },
  { icon: "🌡️", label: "Termodinâmica", category: "Física e Astronomia", keywords: ["termodinâmica", "temperatura", "calor", "entropia"] },
  { icon: "⚙️", label: "Mecânica", category: "Física e Astronomia", keywords: ["mecânica", "força", "movimento", "newton"] },
  { icon: "🧲", label: "Eletromagnetismo", category: "Física e Astronomia", keywords: ["eletromagnetismo", "campo", "magnetismo", "maxwell"] },
  { icon: "⚡", label: "Eletricidade", category: "Física e Astronomia", keywords: ["eletricidade", "circuito", "carga", "corrente"] },
  { icon: "🌊", label: "Ondas", category: "Física e Astronomia", keywords: ["ondas", "oscilações", "frequência", "amplitude"] },
  { icon: "🔦", label: "Óptica", category: "Física e Astronomia", keywords: ["óptica", "luz", "refração", "reflexão"] },
  { icon: "💥", label: "Espalhamento", category: "Física e Astronomia", keywords: ["espalhamento", "scattering", "colisão", "seção de choque"] },
  { icon: "✴️", label: "Física de partículas", category: "Física e Astronomia", keywords: ["partículas", "partícula", "física de partículas", "modelo padrão"] },
  { icon: "🕳️", label: "Relatividade", category: "Física e Astronomia", keywords: ["relatividade", "espaço-tempo", "buraco negro", "einstein"] },
  { icon: "🌀", label: "Fluidos", category: "Física e Astronomia", keywords: ["fluidos", "hidrodinâmica", "turbulência", "escoamento"] },
  { icon: "☢️", label: "Física nuclear", category: "Física e Astronomia", keywords: ["nuclear", "radioatividade", "núcleo", "decaimento"] },
  { icon: "🛰️", label: "Mecânica orbital", category: "Física e Astronomia", keywords: ["órbita", "satélite", "mecânica orbital", "gravitação"] },
  { icon: "🔭", label: "Astronomia", category: "Física e Astronomia", keywords: ["astronomia", "telescópio", "estrelas"] },
  { icon: "🌌", label: "Cosmologia", category: "Física e Astronomia", keywords: ["cosmologia", "universo", "galáxias"] },
  { icon: "🪐", label: "Ciência planetária", category: "Física e Astronomia", keywords: ["planetas", "planetária", "sistema solar"] },
  { icon: "☄️", label: "Astrofísica", category: "Física e Astronomia", keywords: ["astrofísica", "astros", "cometa", "estelar"] },
  { icon: "🍎", label: "Gravitação", category: "Física e Astronomia", keywords: ["gravidade", "gravitação", "queda", "newton"] },

  // Química e Materiais
  { icon: "🧪", label: "Química", category: "Química e Materiais", keywords: ["química", "reação", "laboratório"] },
  { icon: "⚗️", label: "Química orgânica e síntese", category: "Química e Materiais", keywords: ["orgânica", "síntese", "reação", "química orgânica"] },
  { icon: "🧬", label: "Estrutura molecular", category: "Química e Materiais", keywords: ["molécula", "molecular", "estrutura", "ligações"] },
  { icon: "💎", label: "Cristalografia", category: "Química e Materiais", keywords: ["cristal", "cristalografia", "rede cristalina"] },
  { icon: "🧱", label: "Materiais", category: "Química e Materiais", keywords: ["materiais", "estrutura", "propriedades"] },
  { icon: "🔋", label: "Eletroquímica", category: "Química e Materiais", keywords: ["eletroquímica", "bateria", "redox", "potencial"] },
  { icon: "🧴", label: "Soluções e reagentes", category: "Química e Materiais", keywords: ["solução", "reagente", "concentração"] },
  { icon: "🫧", label: "Coloides e interfaces", category: "Química e Materiais", keywords: ["coloide", "interface", "superfície", "dispersão"] },
  { icon: "🪨", label: "Minerais e sólidos", category: "Química e Materiais", keywords: ["mineral", "sólido", "geologia", "inorgânica"] },
  { icon: "🧊", label: "Fases da matéria", category: "Química e Materiais", keywords: ["fases", "estado físico", "transição de fase"] },
  { icon: "🔥", label: "Termoquímica", category: "Química e Materiais", keywords: ["termoquímica", "entalpia", "calor", "combustão"] },
  { icon: "🌈", label: "Espectroscopia", category: "Química e Materiais", keywords: ["espectroscopia", "espectro", "absorção", "emissão"] },
  { icon: "🔹", label: "Nanopartículas", category: "Química e Materiais", keywords: ["nanopartículas", "nano", "nanomateriais"] },
  { icon: "🧵", label: "Polímeros", category: "Química e Materiais", keywords: ["polímeros", "macromoléculas", "materiais poliméricos"] },
  { icon: "🧯", label: "Segurança química", category: "Química e Materiais", keywords: ["segurança", "risco", "laboratório", "química"] },

  // Computação e IA
  { icon: "💻", label: "Programação", category: "Computação e IA", keywords: ["programação", "código", "software"] },
  { icon: "🤖", label: "Inteligência artificial", category: "Computação e IA", keywords: ["ia", "inteligência artificial", "agentes"] },
  { icon: "🧠", label: "Machine learning", category: "Computação e IA", keywords: ["machine learning", "aprendizado de máquina", "modelo"] },
  { icon: "🧶", label: "Redes neurais", category: "Computação e IA", keywords: ["redes neurais", "deep learning", "neural"] },
  { icon: "🗃️", label: "Ciência de dados", category: "Computação e IA", keywords: ["ciência de dados", "dataset", "dados", "analytics"] },
  { icon: "🗄️", label: "Banco de dados", category: "Computação e IA", keywords: ["banco de dados", "sql", "database"] },
  { icon: "🌐", label: "Web", category: "Computação e IA", keywords: ["web", "site", "frontend", "backend"] },
  { icon: "🐍", label: "Python", category: "Computação e IA", keywords: ["python", "programação", "script"] },
  { icon: "⌨️", label: "Código", category: "Computação e IA", keywords: ["código", "coding", "desenvolvimento"] },
  { icon: "🖥️", label: "Sistemas", category: "Computação e IA", keywords: ["sistemas", "computação", "sistema operacional"] },
  { icon: "🔐", label: "Segurança", category: "Computação e IA", keywords: ["segurança", "criptografia", "cyber", "cibersegurança"] },
  { icon: "☁️", label: "Cloud", category: "Computação e IA", keywords: ["cloud", "nuvem", "infraestrutura", "deploy"] },
  { icon: "📡", label: "Redes e comunicação", category: "Computação e IA", keywords: ["redes", "comunicação", "internet", "network"] },
  { icon: "🔁", label: "Automação", category: "Computação e IA", keywords: ["automação", "workflow", "script", "pipeline"] },
  { icon: "🎮", label: "Jogos e simulação", category: "Computação e IA", keywords: ["jogos", "game", "simulação"] },
  { icon: "♟️", label: "IA estratégica", category: "Computação e IA", keywords: ["estratégia", "xadrez", "mcts", "minimax", "jogos"] },

  // Engenharia e Tecnologia
  { icon: "🔧", label: "Engenharia", category: "Engenharia e Tecnologia", keywords: ["engenharia", "projeto", "construção"] },
  { icon: "🔩", label: "Engenharia mecânica", category: "Engenharia e Tecnologia", keywords: ["mecânica", "máquinas", "mecânico"] },
  { icon: "🔌", label: "Engenharia elétrica", category: "Engenharia e Tecnologia", keywords: ["elétrica", "eletrônica", "circuitos"] },
  { icon: "🦾", label: "Robótica", category: "Engenharia e Tecnologia", keywords: ["robótica", "robô", "mecatrônica"] },
  { icon: "🎚️", label: "Instrumentação", category: "Engenharia e Tecnologia", keywords: ["instrumentação", "controle", "sensores", "medição"] },
  { icon: "🏗️", label: "Engenharia civil", category: "Engenharia e Tecnologia", keywords: ["civil", "construção", "estrutura"] },
  { icon: "🏭", label: "Manufatura", category: "Engenharia e Tecnologia", keywords: ["manufatura", "produção", "indústria"] },
  { icon: "🧰", label: "Prototipagem", category: "Engenharia e Tecnologia", keywords: ["protótipo", "prototipagem", "ferramentas"] },
  { icon: "🪛", label: "Manutenção", category: "Engenharia e Tecnologia", keywords: ["manutenção", "montagem", "ajuste"] },
  { icon: "📏", label: "Medição", category: "Engenharia e Tecnologia", keywords: ["medição", "metrologia", "dimensão"] },
  { icon: "🚆", label: "Transportes", category: "Engenharia e Tecnologia", keywords: ["transporte", "ferrovia", "logística", "trem"] },
  { icon: "✈️", label: "Aeroespacial", category: "Engenharia e Tecnologia", keywords: ["aeroespacial", "avião", "aeronáutica"] },
  { icon: "🚢", label: "Naval", category: "Engenharia e Tecnologia", keywords: ["naval", "navio", "oceano"] },
  { icon: "🚗", label: "Automotiva", category: "Engenharia e Tecnologia", keywords: ["automotiva", "carro", "veículo"] },

  // Pesquisa e Laboratório
  { icon: "🔬", label: "Pesquisa científica", category: "Pesquisa e Laboratório", keywords: ["pesquisa", "ciência", "investigação"] },
  { icon: "🥼", label: "Laboratório", category: "Pesquisa e Laboratório", keywords: ["laboratório", "lab", "experimento"] },
  { icon: "🧫", label: "Experimento", category: "Pesquisa e Laboratório", keywords: ["experimento", "ensaio", "experimental"] },
  { icon: "📑", label: "Relatório", category: "Pesquisa e Laboratório", keywords: ["relatório", "report", "documentação"] },
  { icon: "📄", label: "Artigo científico", category: "Pesquisa e Laboratório", keywords: ["artigo", "paper", "científico", "publicação"] },
  { icon: "📚", label: "Bibliografia", category: "Pesquisa e Laboratório", keywords: ["bibliografia", "referências", "literatura"] },
  { icon: "🔎", label: "Investigação", category: "Pesquisa e Laboratório", keywords: ["investigação", "análise", "busca", "pesquisa"] },
  { icon: "🧾", label: "Dados e registros", category: "Pesquisa e Laboratório", keywords: ["dados", "registros", "resultados", "log"] },
  { icon: "✒️", label: "LaTeX e escrita técnica", category: "Pesquisa e Laboratório", keywords: ["latex", "escrita", "técnica", "documento"] },
  { icon: "🎓", label: "Acadêmico", category: "Pesquisa e Laboratório", keywords: ["acadêmico", "universidade", "curso", "trabalho acadêmico"] },
  { icon: "📝", label: "Anotações", category: "Pesquisa e Laboratório", keywords: ["anotações", "notas", "resumo", "fichamento"] },
  { icon: "📓", label: "Caderno de laboratório", category: "Pesquisa e Laboratório", keywords: ["caderno", "laboratório", "diário", "notebook"] },
  { icon: "📎", label: "Referências e anexos", category: "Pesquisa e Laboratório", keywords: ["anexo", "referência", "arquivo", "material"] },

  // Outros — apenas três opções generalizadas
  { icon: "🎒", label: "Estudos", category: "Outros", keywords: ["estudos", "disciplina", "aula", "humanidades", "idiomas", "leitura", "biologia"] },
  { icon: "💼", label: "Trabalho", category: "Outros", keywords: ["trabalho", "carreira", "empresa", "negócios", "gestão"] },
  { icon: "🌟", label: "Pessoal", category: "Outros", keywords: ["pessoal", "vida", "hobby", "arte", "saúde", "rotina"] },
];

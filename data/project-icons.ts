export type ProjectIconCategory =
  | "Organização"
  | "Matemática"
  | "Física e Astronomia"
  | "Química e Materiais"
  | "Biologia e Saúde"
  | "Computação e IA"
  | "Engenharia e Tecnologia"
  | "Humanidades e Sociedade"
  | "Idiomas e Escrita"
  | "Artes e Criação"
  | "Pesquisa e Laboratório"
  | "Negócios e Projetos"
  | "Vida e Desenvolvimento";

export type ProjectIconOption = {
  icon: string;
  label: string;
  category: ProjectIconCategory;
  keywords: string[];
};

export const DEFAULT_PROJECT_ICON = "📁";

export const PROJECT_ICON_CATEGORIES: ProjectIconCategory[] = [
  "Organização",
  "Matemática",
  "Física e Astronomia",
  "Química e Materiais",
  "Biologia e Saúde",
  "Computação e IA",
  "Engenharia e Tecnologia",
  "Humanidades e Sociedade",
  "Idiomas e Escrita",
  "Artes e Criação",
  "Pesquisa e Laboratório",
  "Negócios e Projetos",
  "Vida e Desenvolvimento",
];

export const PROJECT_ICONS: ProjectIconOption[] = [
  // Organização
  { icon: "📁", label: "Pasta", category: "Organização", keywords: ["projeto", "pasta", "geral"] },
  { icon: "🗂️", label: "Arquivo organizado", category: "Organização", keywords: ["arquivo", "categorias", "organização"] },
  { icon: "📋", label: "Checklist", category: "Organização", keywords: ["tarefas", "lista", "planejamento"] },
  { icon: "✅", label: "Concluído", category: "Organização", keywords: ["meta", "feito", "check"] },
  { icon: "📌", label: "Prioridade", category: "Organização", keywords: ["prioridade", "fixar", "importante"] },
  { icon: "🎯", label: "Objetivo", category: "Organização", keywords: ["objetivo", "meta", "alvo"] },
  { icon: "🗓️", label: "Calendário", category: "Organização", keywords: ["agenda", "prazo", "datas"] },
  { icon: "⏱️", label: "Cronômetro", category: "Organização", keywords: ["tempo", "pomodoro", "cronômetro"] },
  { icon: "⏳", label: "Prazo", category: "Organização", keywords: ["prazo", "tempo", "deadline"] },
  { icon: "🚀", label: "Lançamento", category: "Organização", keywords: ["início", "lançamento", "progresso"] },
  { icon: "💡", label: "Ideia", category: "Organização", keywords: ["ideia", "insight", "conceito"] },
  { icon: "🧭", label: "Direção", category: "Organização", keywords: ["direção", "planejamento", "roadmap"] },
  { icon: "🧩", label: "Peça", category: "Organização", keywords: ["parte", "integração", "problema"] },
  { icon: "🔖", label: "Marcador", category: "Organização", keywords: ["marcador", "referência", "bookmark"] },
  { icon: "🗃️", label: "Arquivo", category: "Organização", keywords: ["arquivo", "documentos", "registro"] },

  // Matemática
  { icon: "🧮", label: "Cálculo", category: "Matemática", keywords: ["matemática", "cálculo", "contas"] },
  { icon: "📐", label: "Geometria", category: "Matemática", keywords: ["geometria", "trigonometria", "ângulo"] },
  { icon: "📏", label: "Medidas", category: "Matemática", keywords: ["medida", "geometria", "escala"] },
  { icon: "🔢", label: "Números", category: "Matemática", keywords: ["números", "aritmética", "matemática"] },
  { icon: "➗", label: "Operações", category: "Matemática", keywords: ["divisão", "operações", "aritmética"] },
  { icon: "♾️", label: "Infinito", category: "Matemática", keywords: ["infinito", "limites", "cálculo"] },
  { icon: "∫", label: "Integral", category: "Matemática", keywords: ["integral", "cálculo", "análise"] },
  { icon: "Σ", label: "Somatório", category: "Matemática", keywords: ["somatório", "séries", "estatística"] },
  { icon: "π", label: "Pi", category: "Matemática", keywords: ["pi", "círculo", "matemática"] },
  { icon: "√", label: "Raiz", category: "Matemática", keywords: ["raiz", "álgebra", "matemática"] },
  { icon: "📊", label: "Estatística", category: "Matemática", keywords: ["estatística", "dados", "probabilidade"] },
  { icon: "🎲", label: "Probabilidade", category: "Matemática", keywords: ["probabilidade", "aleatório", "estatística"] },

  // Física e Astronomia
  { icon: "⚛️", label: "Física quântica", category: "Física e Astronomia", keywords: ["física", "quântica", "átomo"] },
  { icon: "🔭", label: "Astronomia", category: "Física e Astronomia", keywords: ["astronomia", "telescópio", "universo"] },
  { icon: "🪐", label: "Planetas", category: "Física e Astronomia", keywords: ["planeta", "astronomia", "espaço"] },
  { icon: "🌌", label: "Cosmologia", category: "Física e Astronomia", keywords: ["cosmologia", "galáxia", "universo"] },
  { icon: "☄️", label: "Astrofísica", category: "Física e Astronomia", keywords: ["cometa", "astrofísica", "espaço"] },
  { icon: "🛰️", label: "Satélite", category: "Física e Astronomia", keywords: ["satélite", "órbita", "espaço"] },
  { icon: "🧲", label: "Magnetismo", category: "Física e Astronomia", keywords: ["magnetismo", "eletromagnetismo", "campo"] },
  { icon: "⚡", label: "Eletricidade", category: "Física e Astronomia", keywords: ["eletricidade", "energia", "eletromagnetismo"] },
  { icon: "🌡️", label: "Termodinâmica", category: "Física e Astronomia", keywords: ["temperatura", "termodinâmica", "calor"] },
  { icon: "🌊", label: "Ondas", category: "Física e Astronomia", keywords: ["ondas", "oscilações", "mecânica"] },
  { icon: "🔥", label: "Calor", category: "Física e Astronomia", keywords: ["calor", "energia", "termodinâmica"] },
  { icon: "🔋", label: "Energia", category: "Física e Astronomia", keywords: ["energia", "bateria", "potencial"] },

  // Química e Materiais
  { icon: "🧪", label: "Química", category: "Química e Materiais", keywords: ["química", "reação", "laboratório"] },
  { icon: "⚗️", label: "Síntese", category: "Química e Materiais", keywords: ["química", "síntese", "reação"] },
  { icon: "💎", label: "Cristais", category: "Química e Materiais", keywords: ["cristal", "materiais", "estrutura"] },
  { icon: "🪨", label: "Geologia", category: "Química e Materiais", keywords: ["geologia", "mineral", "rocha"] },
  { icon: "🧊", label: "Fases da matéria", category: "Química e Materiais", keywords: ["fase", "sólido", "matéria"] },
  { icon: "🧱", label: "Materiais", category: "Química e Materiais", keywords: ["materiais", "estrutura", "engenharia"] },
  { icon: "🧴", label: "Reagentes", category: "Química e Materiais", keywords: ["reagente", "solução", "química"] },
  { icon: "🫧", label: "Soluções", category: "Química e Materiais", keywords: ["solução", "mistura", "química"] },
  { icon: "🧯", label: "Segurança química", category: "Química e Materiais", keywords: ["segurança", "laboratório", "química"] },

  // Biologia e Saúde
  { icon: "🧬", label: "Genética", category: "Biologia e Saúde", keywords: ["dna", "genética", "biologia"] },
  { icon: "🦠", label: "Microbiologia", category: "Biologia e Saúde", keywords: ["microbiologia", "bactéria", "vírus"] },
  { icon: "🧫", label: "Cultura celular", category: "Biologia e Saúde", keywords: ["célula", "cultura", "biologia"] },
  { icon: "🧠", label: "Neurociência", category: "Biologia e Saúde", keywords: ["cérebro", "neurociência", "cognição"] },
  { icon: "❤️", label: "Cardiologia", category: "Biologia e Saúde", keywords: ["coração", "saúde", "cardiologia"] },
  { icon: "🫀", label: "Anatomia cardíaca", category: "Biologia e Saúde", keywords: ["coração", "anatomia", "fisiologia"] },
  { icon: "🫁", label: "Respiração", category: "Biologia e Saúde", keywords: ["pulmão", "respiração", "fisiologia"] },
  { icon: "🦴", label: "Anatomia", category: "Biologia e Saúde", keywords: ["osso", "anatomia", "biologia"] },
  { icon: "🦷", label: "Odontologia", category: "Biologia e Saúde", keywords: ["dente", "odontologia", "saúde"] },
  { icon: "🌱", label: "Botânica", category: "Biologia e Saúde", keywords: ["planta", "botânica", "biologia"] },
  { icon: "🍄", label: "Micologia", category: "Biologia e Saúde", keywords: ["fungo", "micologia", "biologia"] },
  { icon: "🐾", label: "Zoologia", category: "Biologia e Saúde", keywords: ["animal", "zoologia", "biologia"] },
  { icon: "🩺", label: "Medicina", category: "Biologia e Saúde", keywords: ["medicina", "saúde", "clínica"] },
  { icon: "💊", label: "Farmacologia", category: "Biologia e Saúde", keywords: ["farmacologia", "medicamento", "saúde"] },
  { icon: "🩸", label: "Hematologia", category: "Biologia e Saúde", keywords: ["sangue", "hematologia", "biologia"] },

  // Computação e IA
  { icon: "💻", label: "Programação", category: "Computação e IA", keywords: ["programação", "código", "software"] },
  { icon: "🖥️", label: "Computação", category: "Computação e IA", keywords: ["computador", "sistemas", "computação"] },
  { icon: "⌨️", label: "Código", category: "Computação e IA", keywords: ["código", "programação", "desenvolvimento"] },
  { icon: "🤖", label: "Robótica e IA", category: "Computação e IA", keywords: ["robô", "ia", "inteligência artificial"] },
  { icon: "🐍", label: "Python", category: "Computação e IA", keywords: ["python", "programação", "dados"] },
  { icon: "🌐", label: "Web", category: "Computação e IA", keywords: ["web", "internet", "site"] },
  { icon: "🗄️", label: "Banco de dados", category: "Computação e IA", keywords: ["banco", "dados", "sql"] },
  { icon: "💾", label: "Armazenamento", category: "Computação e IA", keywords: ["dados", "armazenamento", "computação"] },
  { icon: "🔐", label: "Cibersegurança", category: "Computação e IA", keywords: ["segurança", "criptografia", "cyber"] },
  { icon: "📡", label: "Redes", category: "Computação e IA", keywords: ["redes", "comunicação", "internet"] },
  { icon: "🧑‍💻", label: "Desenvolvimento", category: "Computação e IA", keywords: ["dev", "programação", "software"] },
  { icon: "🕹️", label: "Jogos digitais", category: "Computação e IA", keywords: ["jogo", "game", "simulação"] },
  { icon: "♟️", label: "IA estratégica", category: "Computação e IA", keywords: ["estratégia", "xadrez", "ia"] },

  // Engenharia e Tecnologia
  { icon: "⚙️", label: "Engenharia", category: "Engenharia e Tecnologia", keywords: ["engenharia", "mecânica", "sistema"] },
  { icon: "🔧", label: "Manutenção", category: "Engenharia e Tecnologia", keywords: ["ferramenta", "manutenção", "engenharia"] },
  { icon: "🔩", label: "Mecânica", category: "Engenharia e Tecnologia", keywords: ["mecânica", "parafuso", "máquinas"] },
  { icon: "🛠️", label: "Construção", category: "Engenharia e Tecnologia", keywords: ["construção", "ferramentas", "engenharia"] },
  { icon: "🪛", label: "Montagem", category: "Engenharia e Tecnologia", keywords: ["montagem", "ferramenta", "hardware"] },
  { icon: "🔌", label: "Eletrônica", category: "Engenharia e Tecnologia", keywords: ["eletrônica", "circuito", "energia"] },
  { icon: "🏗️", label: "Engenharia civil", category: "Engenharia e Tecnologia", keywords: ["civil", "estrutura", "construção"] },
  { icon: "🏭", label: "Indústria", category: "Engenharia e Tecnologia", keywords: ["indústria", "produção", "automação"] },
  { icon: "🚗", label: "Automotiva", category: "Engenharia e Tecnologia", keywords: ["carro", "automotiva", "engenharia"] },
  { icon: "✈️", label: "Aeronáutica", category: "Engenharia e Tecnologia", keywords: ["avião", "aeronáutica", "engenharia"] },
  { icon: "🚆", label: "Ferrovia", category: "Engenharia e Tecnologia", keywords: ["trem", "ferrovia", "transporte"] },
  { icon: "🏎️", label: "Competição", category: "Engenharia e Tecnologia", keywords: ["corrida", "automotiva", "projeto"] },

  // Humanidades e Sociedade
  { icon: "🏛️", label: "História e sociedade", category: "Humanidades e Sociedade", keywords: ["história", "sociedade", "política"] },
  { icon: "📜", label: "História", category: "Humanidades e Sociedade", keywords: ["história", "documento", "arquivo"] },
  { icon: "🌍", label: "Geografia", category: "Humanidades e Sociedade", keywords: ["geografia", "mundo", "território"] },
  { icon: "🗺️", label: "Território", category: "Humanidades e Sociedade", keywords: ["mapa", "geografia", "território"] },
  { icon: "⚖️", label: "Direito", category: "Humanidades e Sociedade", keywords: ["direito", "justiça", "lei"] },
  { icon: "👥", label: "Sociologia", category: "Humanidades e Sociedade", keywords: ["sociologia", "sociedade", "grupos"] },
  { icon: "🗣️", label: "Debate", category: "Humanidades e Sociedade", keywords: ["debate", "comunicação", "filosofia"] },
  { icon: "🏺", label: "Arqueologia", category: "Humanidades e Sociedade", keywords: ["arqueologia", "antiguidade", "história"] },
  { icon: "🕰️", label: "Tempo histórico", category: "Humanidades e Sociedade", keywords: ["história", "tempo", "cronologia"] },
  { icon: "📰", label: "Atualidades", category: "Humanidades e Sociedade", keywords: ["notícia", "atualidades", "sociedade"] },
  { icon: "🕊️", label: "Relações internacionais", category: "Humanidades e Sociedade", keywords: ["relações", "internacional", "paz"] },

  // Idiomas e Escrita
  { icon: "📚", label: "Estudos e leitura", category: "Idiomas e Escrita", keywords: ["livro", "leitura", "estudo"] },
  { icon: "📖", label: "Leitura", category: "Idiomas e Escrita", keywords: ["livro", "leitura", "literatura"] },
  { icon: "✍️", label: "Escrita", category: "Idiomas e Escrita", keywords: ["escrita", "redação", "texto"] },
  { icon: "📝", label: "Anotações", category: "Idiomas e Escrita", keywords: ["anotações", "resumo", "notas"] },
  { icon: "🖋️", label: "Escrita acadêmica", category: "Idiomas e Escrita", keywords: ["artigo", "acadêmico", "escrita"] },
  { icon: "🔤", label: "Idiomas", category: "Idiomas e Escrita", keywords: ["idioma", "vocabulário", "língua"] },
  { icon: "💬", label: "Conversação", category: "Idiomas e Escrita", keywords: ["conversa", "idioma", "comunicação"] },
  { icon: "🎙️", label: "Pronúncia", category: "Idiomas e Escrita", keywords: ["pronúncia", "fala", "idioma"] },
  { icon: "🔠", label: "Vocabulário", category: "Idiomas e Escrita", keywords: ["vocabulário", "palavras", "idioma"] },
  { icon: "🈯", label: "Línguas asiáticas", category: "Idiomas e Escrita", keywords: ["japonês", "chinês", "idiomas"] },

  // Artes e Criação
  { icon: "🎨", label: "Artes visuais", category: "Artes e Criação", keywords: ["arte", "pintura", "design"] },
  { icon: "🖌️", label: "Pintura", category: "Artes e Criação", keywords: ["pintura", "arte", "ilustração"] },
  { icon: "✏️", label: "Desenho", category: "Artes e Criação", keywords: ["desenho", "arte", "sketch"] },
  { icon: "🖼️", label: "Design visual", category: "Artes e Criação", keywords: ["imagem", "design", "arte"] },
  { icon: "📷", label: "Fotografia", category: "Artes e Criação", keywords: ["foto", "fotografia", "imagem"] },
  { icon: "🎬", label: "Cinema e vídeo", category: "Artes e Criação", keywords: ["cinema", "vídeo", "filme"] },
  { icon: "🎭", label: "Teatro", category: "Artes e Criação", keywords: ["teatro", "atuação", "arte"] },
  { icon: "🎵", label: "Música", category: "Artes e Criação", keywords: ["música", "áudio", "som"] },
  { icon: "🎹", label: "Piano", category: "Artes e Criação", keywords: ["piano", "música", "instrumento"] },
  { icon: "🎸", label: "Violão e guitarra", category: "Artes e Criação", keywords: ["guitarra", "violão", "música"] },
  { icon: "🎧", label: "Áudio", category: "Artes e Criação", keywords: ["áudio", "som", "música"] },
  { icon: "🧵", label: "Moda e têxtil", category: "Artes e Criação", keywords: ["costura", "têxtil", "moda"] },

  // Pesquisa e Laboratório
  { icon: "🔬", label: "Microscopia", category: "Pesquisa e Laboratório", keywords: ["microscópio", "laboratório", "pesquisa"] },
  { icon: "🥼", label: "Laboratório", category: "Pesquisa e Laboratório", keywords: ["laboratório", "pesquisa", "experimento"] },
  { icon: "🧤", label: "Procedimento experimental", category: "Pesquisa e Laboratório", keywords: ["laboratório", "segurança", "experimento"] },
  { icon: "📈", label: "Análise de resultados", category: "Pesquisa e Laboratório", keywords: ["gráfico", "análise", "resultados"] },
  { icon: "📉", label: "Análise de tendência", category: "Pesquisa e Laboratório", keywords: ["dados", "tendência", "resultados"] },
  { icon: "📑", label: "Artigos", category: "Pesquisa e Laboratório", keywords: ["artigo", "paper", "referência"] },
  { icon: "🧾", label: "Registro", category: "Pesquisa e Laboratório", keywords: ["registro", "dados", "documentação"] },
  { icon: "🗒️", label: "Caderno de laboratório", category: "Pesquisa e Laboratório", keywords: ["caderno", "notas", "laboratório"] },
  { icon: "🔎", label: "Investigação", category: "Pesquisa e Laboratório", keywords: ["pesquisa", "investigação", "busca"] },
  { icon: "📎", label: "Referências", category: "Pesquisa e Laboratório", keywords: ["referência", "anexo", "documento"] },

  // Negócios e Projetos
  { icon: "💼", label: "Trabalho", category: "Negócios e Projetos", keywords: ["trabalho", "negócio", "carreira"] },
  { icon: "🏢", label: "Empresa", category: "Negócios e Projetos", keywords: ["empresa", "organização", "negócio"] },
  { icon: "🤝", label: "Parceria", category: "Negócios e Projetos", keywords: ["parceria", "equipe", "negociação"] },
  { icon: "💰", label: "Finanças", category: "Negócios e Projetos", keywords: ["dinheiro", "finanças", "orçamento"] },
  { icon: "💳", label: "Pagamentos", category: "Negócios e Projetos", keywords: ["pagamento", "finanças", "custo"] },
  { icon: "📦", label: "Produto", category: "Negócios e Projetos", keywords: ["produto", "entrega", "logística"] },
  { icon: "🚚", label: "Logística", category: "Negócios e Projetos", keywords: ["logística", "entrega", "transporte"] },
  { icon: "🛒", label: "Comércio", category: "Negócios e Projetos", keywords: ["comércio", "vendas", "produto"] },
  { icon: "📣", label: "Marketing", category: "Negócios e Projetos", keywords: ["marketing", "divulgação", "comunicação"] },
  { icon: "📆", label: "Planejamento", category: "Negócios e Projetos", keywords: ["planejamento", "cronograma", "gestão"] },

  // Vida e Desenvolvimento
  { icon: "🎓", label: "Formação", category: "Vida e Desenvolvimento", keywords: ["curso", "faculdade", "aprendizado"] },
  { icon: "🎒", label: "Estudos", category: "Vida e Desenvolvimento", keywords: ["estudo", "escola", "faculdade"] },
  { icon: "🏃", label: "Corrida", category: "Vida e Desenvolvimento", keywords: ["corrida", "exercício", "saúde"] },
  { icon: "🏋️", label: "Treino", category: "Vida e Desenvolvimento", keywords: ["academia", "treino", "exercício"] },
  { icon: "🧘", label: "Bem-estar", category: "Vida e Desenvolvimento", keywords: ["meditação", "bem-estar", "saúde"] },
  { icon: "🥗", label: "Nutrição", category: "Vida e Desenvolvimento", keywords: ["alimentação", "nutrição", "saúde"] },
  { icon: "🍳", label: "Culinária", category: "Vida e Desenvolvimento", keywords: ["culinária", "cozinha", "receita"] },
  { icon: "🏠", label: "Casa", category: "Vida e Desenvolvimento", keywords: ["casa", "pessoal", "organização"] },
  { icon: "🧹", label: "Rotina", category: "Vida e Desenvolvimento", keywords: ["rotina", "limpeza", "organização"] },
  { icon: "🌎", label: "Viagens", category: "Vida e Desenvolvimento", keywords: ["viagem", "mundo", "intercâmbio"] },
  { icon: "🎮", label: "Jogos", category: "Vida e Desenvolvimento", keywords: ["jogos", "lazer", "game"] },
  { icon: "🧑‍🤝‍🧑", label: "Equipe", category: "Vida e Desenvolvimento", keywords: ["equipe", "grupo", "colaboração"] },
];

# Projeto — Escrita Científica e LaTeX/Typst

## Objetivo

Auxiliar na produção e revisão de textos científicos, relatórios e documentos acadêmicos, principalmente em LaTeX/Typst.

## Atividades

Há trabalho relacionado à descrição de atividades desenvolvidas durante um IPA, envolvendo:

- organização de experimento;
- explicação do funcionamento da IA JAIME;
- integração com a automatizadora de experimentos RaspILUM;
- preparação do experimento para visualização da mudança de cor durante etapas.

## Escrita em LaTeX

Foi utilizado código envolvendo:

```latex
\\phantomsection
\\section*{Atividades}
\\addcontentsline{toc}{section}{Atividades}
```

Esses comandos foram usados para integrar uma seção não numerada ao sumário e criar uma âncora apropriada.

## Orientação de revisão

Ao revisar texto científico:

- preservar o significado experimental;
- corrigir gramática e clareza;
- evitar afirmações sem suporte;
- diferenciar método, observação, interpretação e conclusão;
- manter consistência de nomenclatura;
- não inventar resultados.

## Documentação

Projetos científicos devem manter separadas:

```text
observação
   ↓
interpretação
   ↓
hipótese
   ↓
conclusão
```

## Questões em aberto

- Padronização final entre LaTeX e Typst.
- Estrutura definitiva dos relatórios.
- Padrão de referências bibliográficas.
- Convenções de nomenclatura de equipamentos e métodos.

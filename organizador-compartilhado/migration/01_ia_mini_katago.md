# Projeto — IA e Mini-KataGo

## Objetivo

Estudar e desenvolver sistemas de IA relacionados a jogos de estratégia, com interesse especial em redes neurais, busca e aprendizado para jogos.

Um dos projetos recorrentes é um **Mini-KataGo**, usado como caminho prático para entender como sistemas modernos de IA para jogos funcionam.

## Interesses técnicos

- Redes neurais.
- Busca em árvores.
- Aprendizado por reforço.
- Avaliação de posições.
- Representação de estados de jogos.
- Integração entre uma rede neural e um mecanismo de busca.
- Experimentos pequenos antes de arquiteturas maiores.

## Direção de estudo

O projeto deve priorizar compreensão dos fundamentos e construção incremental.

Uma possível decomposição:

```text
Estado do jogo
    ↓
Representação numérica
    ↓
Rede neural / avaliador
    ↓
Busca
    ↓
Seleção da jogada
    ↓
Execução
    ↓
Novo estado
```

## Relação com estudo

O interesse não é somente obter um agente que jogue, mas entender o mecanismo por trás dele, incluindo as decisões matemáticas e computacionais.

## Questões em aberto

- Linguagem e framework finais.
- Arquitetura exata da rede.
- Algoritmo de busca a utilizar em cada etapa.
- Fonte e formato dos dados de treinamento.
- Como medir força e progresso.
- Estratégia de treinamento e autojogo.

## Próximos passos

1. Fixar um jogo pequeno para prototipagem.
2. Implementar a representação do estado.
3. Criar um jogador aleatório e um baseline simples.
4. Criar o avaliador.
5. Introduzir busca.
6. Experimentar aprendizado.
7. Comparar versões por métricas objetivas.

## Observação

Este documento consolida somente o contexto disponível no histórico resumido; detalhes de implementações antigas devem ser recuperados das conversas originais caso sejam necessários.

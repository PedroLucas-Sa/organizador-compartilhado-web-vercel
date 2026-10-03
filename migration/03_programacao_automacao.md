# Projeto — Programação e Automação Laboratorial

## Objetivo

Criar uma arquitetura de software para automação de experimentos laboratoriais, com backend em Python, comunicação em tempo real e integração com serviços de LLM.

## Arquitetura discutida

### Backend

Tecnologias principais:

- Python.
- FastAPI.
- WebSocket.
- Programação assíncrona com `async`/`await`.

O backend controla a execução de experimentos representados por funções, por exemplo:

```python
def experimento_1():
    ...
```

Cada experimento contém etapas sequenciais.

## Exemplo conceitual

```text
Experimento
    ↓
Etapa 1: agitação
    ↓
Etapa 2: pipetagem
    ↓
Etapa 3: próxima operação
```

Algumas operações não podem ocorrer ao mesmo tempo.

Por exemplo, a pipetagem não deve ser iniciada enquanto uma condição de bloqueio causada pela etapa de agitação ainda estiver ativa.

## WebSocket

O WebSocket será utilizado para comunicação contínua entre frontend e backend.

Eventos possíveis:

- mudança de etapa;
- início/fim de operação;
- progresso;
- estado do equipamento;
- erros;
- logs;
- mensagens de controle.

## `async` e `await`

A programação assíncrona foi estudada como forma de lidar com operações que precisam aguardar eventos sem bloquear desnecessariamente o servidor.

A decisão conceitual importante é:

> O fato de o software ser assíncrono não significa que os equipamentos físicos possam operar concorrentemente.

As restrições físicas devem ser implementadas explicitamente.

## Controle de recursos

Uma arquitetura futura pode utilizar:

```text
Orquestrador
    ↓
Máquina de estados
    ↓
Controle de recursos
    ↓
Drivers dos equipamentos
```

O sistema deve saber:

- qual equipamento está ocupado;
- quais operações são incompatíveis;
- quais recursos uma etapa exige;
- quando uma etapa foi realmente concluída;
- o que fazer em caso de erro.

## Integração com LLM

Também foi considerada a existência de um backend/serviço ligado à API de uma LLM, inclusive em ambiente local.

A separação recomendada é:

```text
LLM
 ↓
interpretação / assistência
 ↓
camada de software
 ↓
lógica determinística do experimento
 ↓
equipamentos
```

A LLM não deve substituir as garantias determinísticas necessárias para proteger a sequência física do experimento.

## Exemplo conceitual

```python
async def experimento_1():
    await iniciar_agitacao()
    await finalizar_agitacao()

    await iniciar_pipetagem()
    await finalizar_pipetagem()
```

Esse código é apenas ilustrativo; a implementação real precisa incluir estado, erro, timeout e confirmação do equipamento.

## Questões em aberto

- Protocolo WebSocket.
- Máquina de estados.
- Gerenciamento de recursos.
- Controle de equipamentos.
- Logs.
- Tratamento de falhas.
- Timeouts.
- Recuperação.
- Interface de controle manual.
- Limites de atuação da LLM.

## Próximos passos

1. Implementar FastAPI + WebSocket mínimo.
2. Criar `experimento_1()`.
3. Criar uma máquina de estados simples.
4. Implementar uma operação bloqueante e uma não bloqueante.
5. Adicionar logs.
6. Adicionar tratamento de falhas.
7. Integrar a camada de LLM separadamente.

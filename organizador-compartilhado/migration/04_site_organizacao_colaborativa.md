# Projeto — Site Colaborativo de Organização

## Objetivo

Criar um site hospedado na Vercel para organização colaborativa, permitindo que duas pessoas compartilhem e modifiquem informações.

## Requisitos já definidos

### Autenticação

Foi definida a necessidade de login com identificação e senha.

As credenciais específicas não devem ser registradas neste arquivo.

## Interface

Foi solicitado:

- uma aba lateral de **horário semanal**;
- uma área para separar/organizar horários;
- edição colaborativa;
- ambos os participantes podem modificar os horários.

## Modelo conceitual

```text
Login
  ↓
Dashboard
  ├── Horário semanal
  ├── Organização de horários
  └── Dados compartilhados
```

## Colaboração

O estado dos horários precisa ser compartilhado entre os participantes.

Uma arquitetura provável é:

```text
Frontend
    ↓
API / banco
    ↓
dados compartilhados
```

Para edição em tempo real, pode ser acrescentado WebSocket ou mecanismo equivalente.

## Questões em aberto

- Framework frontend.
- Banco de dados.
- Sistema de autenticação definitivo.
- Modelo de permissões.
- Conflito de edições simultâneas.
- Persistência dos horários.
- Deploy e variáveis de ambiente.
- Interface final da aba lateral.

## Próximos passos

1. Definir stack.
2. Modelar usuário e horário.
3. Criar autenticação segura.
4. Criar dashboard.
5. Implementar grade semanal.
6. Implementar edição.
7. Persistir alterações.
8. Adicionar atualização em tempo real, se necessária.
9. Fazer deploy na Vercel.

## Observação

Credenciais reais devem permanecer em variáveis de ambiente ou em um sistema de autenticação apropriado, e nunca no arquivo de contexto.

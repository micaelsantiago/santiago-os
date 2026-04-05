# Módulo: Tarefas

Kanban board com drag-and-drop, colunas configuráveis, prioridades e tags.

---

## Visão Geral

- **Rota**: `/tasks`
- **Status**: Implementado
- **Componentes principais**: `TaskBoard`, `KanbanColumn`, `TaskCard`, `TaskDialog`, `TaskToolbar`

```
┌─ TaskToolbar ─────────────────────────────────┐
│  [+ Nova tarefa]  [Filtros]                    │
���────────────────────────────────────────────────┤
│  Backlog      │  Em progresso  │  Concluído    │
│  ┌──────────┐ │  ┌──────────┐  │  ┌──────────┐│
│  │ TaskCard │ │  │ TaskCard │  │  │ TaskCard ││
│  └──────────┘ │  └──────────┘  │  └──────────┘│
│  ┌──────────┐ │                │               │
│  │ TaskCard │ │                │               │
│  └──────────┘ │                │               │
└────────────────────────────────────────────────┘
```

## Fluxo de Dados

### Primeiro acesso

1. `tasks/page.tsx` (Server) chama `getOrCreateDefaultBoard()`
2. Se o usuário não tem board, cria um com 3 colunas padrão (Backlog, Em progresso, Concluído)
3. Passa board para `TasksPageClient`

### Renderização

1. `TaskBoard` (Client) usa TanStack Query para buscar colunas e tarefas
2. Organiza tarefas por coluna via `useMemo`
3. Cada `KanbanColumn` renderiza seus `TaskCard`s ordenados por `position`

### Drag & Drop

Implementado com **dnd-kit**:

1. `TaskBoard` configura `DndContext` com sensores de pointer e keyboard
2. Ao arrastar, `handleDragOver` atualiza a coluna destino localmente
3. Ao soltar, `handleDragEnd` chama `moveTask()` Server Action
4. `moveTask` valida que a coluna destino pertence ao `effectiveUserId`
5. TanStack Query invalida cache automaticamente

## Modelo de Dados

```
Board (1) ──▶ Columns (N) ──▶ Tasks (N) ──▶ TaskTags (N)
```

- **Board**: container do Kanban. Tipo `tasks` ou `project`
- **Column**: coluna do board (Backlog, Em progresso, etc.). Ordenada por `position`
- **Task**: tarefa com título, descrição, prioridade, status, prazo
- **TaskTag**: tags livres (text) associadas a uma task

## Server Actions

| Action | Parâmetros | Permissão | Descrição |
|--------|-----------|-----------|-----------|
| `getOrCreateDefaultBoard` | — | master/member | Busca ou cria board padrão |
| `getColumns` | boardId | master/member | Lista colunas do board |
| `createColumn` | CreateColumnInput | master/member | Cria coluna |
| `updateColumn` | id, UpdateColumnInput | master/member | Atualiza coluna |
| `deleteColumn` | id | **master only** | Deleta coluna |
| `getBoardTasks` | boardId | master/member | Lista tarefas do board |
| `createTask` | CreateTaskInput | master/member | Cria tarefa |
| `updateTask` | id, UpdateTaskInput | master/member | Atualiza tarefa |
| `deleteTask` | id | **master only** | Deleta tarefa |
| `moveTask` | MoveTaskInput | master/member | Move tarefa entre colunas |
| `addTaskTag` | taskId, tag | master/member | Adiciona tag |
| `removeTaskTag` | taskId, tag | **master only** | Remove tag |

## Schemas Zod

Definidos em `src/modules/tasks/types/task.types.ts`:

- `createTaskSchema`: column_id (uuid), title (1-255), description, priority, due_date
- `updateTaskSchema`: todos opcionais
- `moveTaskSchema`: taskId (uuid), columnId (uuid), position (int)
- `createColumnSchema`: board_id (uuid), title, position, color
- `updateColumnSchema`: title, color (opcionais)

---

Próximo: [Módulo de Notas](./notes.md)

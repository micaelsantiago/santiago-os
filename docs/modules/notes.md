# Módulo: Notas

Editor Markdown com Tiptap, organização por pastas e busca full-text.

---

## Visão Geral

- **Rota**: `/notes`
- **Status**: Implementado
- **Componentes principais**: `NoteSidebar`, `NoteList`, `NoteEditor`, `NoteToolbar`

```
┌─ NoteSidebar ──┬─ NoteList ──────┬─ NoteEditor ───────────────┐
│  Pastas         │  Nota 1 (pin)   │  Título editável           │
│  ├── Trabalho   │  Nota 2         │                            │
│  └── Pessoal    │  Nota 3         │  Corpo com Tiptap          │
│                 │  Nota 4         │  (Markdown renderizado)    │
│  [+ Pasta]      │                 │              [Salvando...] │
���─────────────────┴─────────────────┴────────────────────────────┘
```

## Fluxo de Dados

### Listagem

1. `notes/page.tsx` (Server) busca notas iniciais via `getNotes()`
2. `NotesPageClient` renderiza sidebar + lista + editor
3. Zustand store (`note-store`) gerencia: nota selecionada, pasta ativa

### Edição

1. Ao selecionar uma nota, `NoteEditor` carrega conteúdo via TanStack Query
2. O editor Tiptap renderiza o HTML
3. A cada alteração, debounce de **1 segundo** antes de salvar
4. O HTML é **sanitizado com DOMPurify** antes de chamar `updateNote()`
5. Indicador "Salvando..." aparece durante o save

### Segurança do conteúdo

O editor armazena HTML (output do Tiptap). Para evitar XSS:

1. `DOMPurify.sanitize()` é chamado no `onUpdate` do editor, **antes** de salvar
2. O Tiptap tem sanitização interna ao renderizar
3. Se o conteúdo for exibido fora do Tiptap (previews, busca), deve ser sanitizado novamente

## Modelo de Dados

```
NoteFolder (self-referencial via parent_id)
    └── Note (1:N)
        └── NoteTag (1:N)
```

- **NoteFolder**: pastas com hierarquia (parent_id). Ordenadas por `position`
- **Note**: nota com título, conteúdo HTML, pin. Pode estar em uma pasta ou na raiz (folder_id = null)
- **NoteTag**: tags livres associadas a uma nota (não implementado na UI ainda)

## Server Actions

| Action | Parâmetros | Permissão | Descrição |
|--------|-----------|-----------|-----------|
| `createNote` | CreateNoteInput | master/member | Cria nota |
| `updateNote` | id, UpdateNoteInput | master/member | Atualiza nota |
| `deleteNote` | id | **master only** | Deleta nota |
| `getNotes` | folderId? | master/member | Lista notas (filtro por pasta) |
| `getNoteById` | id | master/member | Busca nota por ID |
| `createFolder` | CreateFolderInput | master/member | Cria pasta |
| `getFolders` | — | master/member | Lista pastas |
| `deleteFolder` | id | **master only** | Deleta pasta |

## Zustand Store

```typescript
// src/modules/notes/store/note-store.ts
interface NoteStore {
  selectedNoteId: string | null
  selectedFolderId: string | null
  setSelectedNote: (id: string | null) => void
  setSelectedFolder: (id: string | null) => void
}
```

Apenas estado de UI — nunca dados do servidor.

## Busca Full-Text

Índice GIN com `to_tsvector('portuguese', ...)` para busca em título e conteúdo. Configurado para idioma português.

```sql
CREATE INDEX ON notes USING gin (
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, ''))
);
```

---

Próximo: [Módulo de Settings](./settings.md)

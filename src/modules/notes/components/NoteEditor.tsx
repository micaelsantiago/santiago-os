'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import { noteQueryOptions } from '@/modules/notes/queries/note.queries'
import { updateNote } from '@/modules/notes/actions/note.actions'
import { useNoteStore } from '@/modules/notes/store/note-store'

export function NoteEditor() {
  const { selectedNoteId } = useNoteStore()
  const queryClient = useQueryClient()
  const { data: result } = useQuery(
    noteQueryOptions(selectedNoteId ?? ''),
  )
  const note = result?.success ? result.data : null

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const currentNoteIdRef = useRef<string | null>(null)

  const saveContent = useCallback(
    (content: string) => {
      if (!selectedNoteId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        await updateNote(selectedNoteId, { content })
        queryClient.invalidateQueries({ queryKey: ['notes'] })
      }, 1000)
    },
    [selectedNoteId, queryClient],
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comece a escrever...',
      }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      saveContent(ed.getHTML())
    },
    editorProps: {
      attributes: {
        style:
          'outline: none; min-height: 100%; font-size: 13px; font-weight: 400; color: var(--color-text); line-height: 1.6;',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (note && currentNoteIdRef.current !== note.id) {
      currentNoteIdRef.current = note.id
      editor.commands.setContent(note.content || '')
      if (titleRef.current) {
        titleRef.current.value = note.title
      }
    }
    if (!note && !selectedNoteId) {
      currentNoteIdRef.current = null
      editor.commands.setContent('')
      if (titleRef.current) {
        titleRef.current.value = ''
      }
    }
  }, [editor, note, selectedNoteId])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedNoteId) return
      const title = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        await updateNote(selectedNoteId, { title: title || 'Sem título' })
        queryClient.invalidateQueries({ queryKey: ['notes'] })
      }, 1000)
    },
    [selectedNoteId, queryClient],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!selectedNoteId || !note) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-3)',
          fontSize: '13px',
          fontWeight: 400,
        }}
      >
        Selecione uma nota ou crie uma nova
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <input
        ref={titleRef}
        type="text"
        defaultValue={note.title}
        onChange={handleTitleChange}
        className="w-full border-none bg-transparent px-6 pt-6 pb-2 outline-none"
        style={{
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--color-text)',
        }}
      />
      <div className="flex-1 overflow-auto px-6 pb-6">
        <EditorContent editor={editor} className="note-editor" />
      </div>
      <style>{`
        .note-editor .tiptap {
          outline: none;
          min-height: 100%;
        }
        .note-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--color-text-3);
          pointer-events: none;
          height: 0;
          font-size: 13px;
          font-weight: 400;
        }
        .note-editor .tiptap h1,
        .note-editor .tiptap h2,
        .note-editor .tiptap h3 {
          font-weight: 500;
          color: var(--color-text);
        }
        .note-editor .tiptap h1 { font-size: 16px; margin: 1em 0 0.5em; }
        .note-editor .tiptap h2 { font-size: 14px; margin: 1em 0 0.5em; }
        .note-editor .tiptap h3 { font-size: 13px; margin: 1em 0 0.5em; }
        .note-editor .tiptap p { margin: 0.25em 0; }
        .note-editor .tiptap ul,
        .note-editor .tiptap ol {
          padding-left: 1.5em;
          margin: 0.25em 0;
        }
        .note-editor .tiptap code {
          font-family: var(--font-mono);
          font-size: 12px;
          background: var(--color-bg-2);
          padding: 2px 4px;
          border-radius: var(--radius-sm);
        }
        .note-editor .tiptap pre {
          background: var(--color-bg-2);
          padding: 12px;
          border-radius: var(--radius);
          margin: 0.5em 0;
          overflow-x: auto;
        }
        .note-editor .tiptap pre code {
          background: none;
          padding: 0;
        }
        .note-editor .tiptap blockquote {
          border-left: 2px solid var(--color-border-app);
          padding-left: 12px;
          margin: 0.5em 0;
          color: var(--color-text-2);
        }
      `}</style>
    </div>
  )
}

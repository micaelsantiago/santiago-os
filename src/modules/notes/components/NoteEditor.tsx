'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { noteQueryOptions } from '@/modules/notes/queries/note.queries'
import { updateNote } from '@/modules/notes/actions/note.actions'
import { useNoteStore } from '@/modules/notes/store/note-store'

export function NoteEditor() {
  const { selectedNoteId } = useNoteStore()
  const queryClient = useQueryClient()
  const { data: result, isLoading } = useQuery(noteQueryOptions(selectedNoteId ?? ''))
  const note = result?.success ? result.data : null

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const currentNoteIdRef = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)

  const saveContent = useCallback(
    (content: string) => {
      if (!selectedNoteId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setSaving(true)
      debounceRef.current = setTimeout(async () => {
        await updateNote(selectedNoteId, { content })
        queryClient.invalidateQueries({ queryKey: ['notes'] })
        setSaving(false)
      }, 1000)
    },
    [selectedNoteId, queryClient],
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Comece a escrever...' })],
    content: '',
    onUpdate: ({ editor: ed }) => saveContent(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'note-editor__content',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (note && currentNoteIdRef.current !== note.id) {
      currentNoteIdRef.current = note.id
      editor.commands.setContent(note.content || '')
      if (titleRef.current) titleRef.current.value = note.title
    }
    if (!note && !selectedNoteId) {
      currentNoteIdRef.current = null
      editor.commands.setContent('')
      if (titleRef.current) titleRef.current.value = ''
    }
  }, [editor, note, selectedNoteId])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedNoteId) return
      const title = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setSaving(true)
      debounceRef.current = setTimeout(async () => {
        await updateNote(selectedNoteId, { title: title || 'Sem título' })
        queryClient.invalidateQueries({ queryKey: ['notes'] })
        setSaving(false)
      }, 1000)
    },
    [selectedNoteId, queryClient],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!selectedNoteId) {
    return <div className="note-editor note-editor--empty">Selecione uma nota ou crie uma nova</div>
  }

  if (isLoading) {
    return (
      <div className="note-editor note-editor--empty">
        <Loader2 size={16} strokeWidth={1.5} className="note-editor__spinner" />
        Carregando nota...
      </div>
    )
  }

  if (!note) {
    return <div className="note-editor note-editor--empty">Nota não encontrada</div>
  }

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <input
          ref={titleRef}
          type="text"
          defaultValue={note.title}
          onChange={handleTitleChange}
          className="note-editor__title"
        />
        {saving && (
          <span className="note-editor__saving">
            <Loader2 size={12} strokeWidth={1.5} className="note-editor__spinner" />
            Salvando...
          </span>
        )}
      </div>
      <div className="note-editor__body">
        <EditorContent editor={editor} className="note-editor__tiptap" />
      </div>
    </div>
  )
}

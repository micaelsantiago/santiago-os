'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, FolderPlus, Folder, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { foldersQueryOptions } from '@/modules/notes/queries/note.queries'
import { createFolder } from '@/modules/notes/actions/note.actions'
import { useNoteStore } from '@/modules/notes/store/note-store'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NoteSidebar() {
  const { selectedFolderId, selectFolder } = useNoteStore()
  const queryClient = useQueryClient()
  const { data: result, isLoading } = useQuery(foldersQueryOptions())
  const folders = result?.success ? result.data : []

  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newFolderTitle, setNewFolderTitle] = useState('')

  const handleCreateFolder = async () => {
    if (!newFolderTitle.trim()) {
      setIsCreating(false)
      return
    }
    setIsSaving(true)
    await createFolder({ title: newFolderTitle.trim(), parent_id: null })
    await queryClient.invalidateQueries({ queryKey: ['note-folders'] })
    setNewFolderTitle('')
    setIsCreating(false)
    setIsSaving(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreateFolder()
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewFolderTitle('')
    }
  }

  return (
    <div className="note-sidebar">
      <div className="note-sidebar__header">
        <span className="note-sidebar__label">Pastas</span>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="note-sidebar__add-btn"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 size={16} strokeWidth={1.5} className="note-sidebar__spinner" />
          ) : (
            <FolderPlus size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="note-sidebar__list">
          {isLoading ? (
            <div className="note-sidebar__status">
              <Loader2 size={14} strokeWidth={1.5} className="note-sidebar__spinner" />
              Carregando...
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => selectFolder(null)}
                className={`note-sidebar__item ${selectedFolderId === null ? 'note-sidebar__item--active' : ''}`}
              >
                <FileText size={16} strokeWidth={1.5} />
                <span>Todas as notas</span>
              </button>

              {folders.map((folder) => (
                <button
                  type="button"
                  key={folder.id}
                  onClick={() => selectFolder(folder.id)}
                  className={`note-sidebar__item ${selectedFolderId === folder.id ? 'note-sidebar__item--active' : ''}`}
                >
                  <Folder size={16} strokeWidth={1.5} />
                  <span className="truncate">{folder.title}</span>
                </button>
              ))}
            </>
          )}

          {isCreating && (
            <div className="note-sidebar__item">
              <input
                type="text"
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleCreateFolder}
                placeholder="Nome da pasta"
                autoFocus
                disabled={isSaving}
                className="note-sidebar__input"
              />
            </div>
          )}

          {isSaving && (
            <div className="note-sidebar__status">
              <Loader2 size={14} strokeWidth={1.5} className="note-sidebar__spinner" />
              Criando pasta...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

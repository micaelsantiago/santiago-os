'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, FolderPlus, Folder } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { foldersQueryOptions } from '@/modules/notes/queries/note.queries'
import { createFolder } from '@/modules/notes/actions/note.actions'
import { useNoteStore } from '@/modules/notes/store/note-store'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NoteSidebar() {
  const { selectedFolderId, selectFolder } = useNoteStore()
  const queryClient = useQueryClient()
  const { data: result } = useQuery(foldersQueryOptions())
  const folders = result?.success ? result.data : []

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderTitle, setNewFolderTitle] = useState('')

  const handleCreateFolder = async () => {
    if (!newFolderTitle.trim()) {
      setIsCreating(false)
      return
    }
    await createFolder({ title: newFolderTitle.trim(), parent_id: null })
    queryClient.invalidateQueries({ queryKey: ['note-folders'] })
    setNewFolderTitle('')
    setIsCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFolder()
    }
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewFolderTitle('')
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        width: '180px',
        minWidth: '180px',
        borderRight: '0.5px solid var(--color-border-app)',
        backgroundColor: 'var(--color-bg-2)',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          borderBottom: '0.5px solid var(--color-border-app)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--color-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Pastas
        </span>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center"
          style={{
            color: 'var(--color-text-3)',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = 'var(--color-text)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = 'var(--color-text-3)')
          }
        >
          <FolderPlus size={16} strokeWidth={1.5} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <button
          type="button"
          onClick={() => selectFolder(null)}
          className={cn('flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors')}
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color:
              selectedFolderId === null
                ? 'var(--color-accent-text)'
                : 'var(--color-text)',
            backgroundColor:
              selectedFolderId === null
                ? 'var(--color-accent-bg)'
                : 'transparent',
          }}
        >
          <FileText size={16} strokeWidth={1.5} />
          <span>Todas as notas</span>
        </button>

        {folders.map((folder) => (
          <button
            type="button"
            key={folder.id}
            onClick={() => selectFolder(folder.id)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors',
            )}
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color:
                selectedFolderId === folder.id
                  ? 'var(--color-accent-text)'
                  : 'var(--color-text)',
              backgroundColor:
                selectedFolderId === folder.id
                  ? 'var(--color-accent-bg)'
                  : 'transparent',
            }}
          >
            <Folder size={16} strokeWidth={1.5} />
            <span className="truncate">{folder.title}</span>
          </button>
        ))}

        {isCreating && (
          <div className="px-3 py-1.5">
            <input
              type="text"
              value={newFolderTitle}
              onChange={(e) => setNewFolderTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreateFolder}
              placeholder="Nome da pasta"
              autoFocus
              className="w-full border-none bg-transparent outline-none"
              style={{
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--color-text)',
              }}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

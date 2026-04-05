'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  FileText,
  Mail,
  Bot,
  Plus,
  StickyNote,
} from 'lucide-react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        onOpenChange(false)
      }
    },
    [open, onOpenChange],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
      onOpenChange(false)
    },
    [router, onOpenChange],
  )

  if (!open) return null

  return (
    <div
      className="palette__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <div className="palette__container">
        <Command className="palette__command">
          <CommandInput placeholder="Buscar comando..." />
          <CommandList className="palette__list">
            <CommandEmpty className="palette__empty">Nenhum resultado encontrado.</CommandEmpty>

            <CommandGroup heading="Navegar" className="palette__group">
              <CommandItem onSelect={() => navigate('/tasks')} className="palette__item">
                <CheckSquare size={16} strokeWidth={1.5} />
                <span>Tarefas</span>
                <CommandShortcut>T</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/calendar')} className="palette__item">
                <Calendar size={16} strokeWidth={1.5} />
                <span>Calendário</span>
                <CommandShortcut>C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/projects')} className="palette__item">
                <FolderKanban size={16} strokeWidth={1.5} />
                <span>Projetos</span>
                <CommandShortcut>P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/notes')} className="palette__item">
                <FileText size={16} strokeWidth={1.5} />
                <span>Notas</span>
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/email')} className="palette__item">
                <Mail size={16} strokeWidth={1.5} />
                <span>Email</span>
                <CommandShortcut>E</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/agent')} className="palette__item">
                <Bot size={16} strokeWidth={1.5} />
                <span>Agente</span>
                <CommandShortcut>A</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Criar" className="palette__group">
              <CommandItem
                onSelect={() => navigate('/tasks?create=true')}
                className="palette__item"
              >
                <Plus size={16} strokeWidth={1.5} />
                <span>Nova tarefa</span>
              </CommandItem>
              <CommandItem
                onSelect={() => navigate('/notes?create=true')}
                className="palette__item"
              >
                <StickyNote size={16} strokeWidth={1.5} />
                <span>Nova nota</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  )
}

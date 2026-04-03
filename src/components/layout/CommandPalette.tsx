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
    [open, onOpenChange]
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
    [router, onOpenChange]
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <div
        style={{
          width: 480,
          marginTop: 80,
          height: 'fit-content',
        }}
      >
        <Command
          className="border"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border-app)',
            borderWidth: '0.5px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
          }}
        >
          <CommandInput placeholder="Buscar comando..." />
          <CommandList>
            <CommandEmpty
              style={{
                fontSize: 13,
                color: 'var(--color-text-3)',
              }}
            >
              Nenhum resultado encontrado.
            </CommandEmpty>

            <CommandGroup heading="Navegar">
              <CommandItem onSelect={() => navigate('/tasks')}>
                <CheckSquare size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Tarefas</span>
                <CommandShortcut>T</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/calendar')}>
                <Calendar size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Calendário</span>
                <CommandShortcut>C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/projects')}>
                <FolderKanban size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Projetos</span>
                <CommandShortcut>P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/notes')}>
                <FileText size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Notas</span>
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/email')}>
                <Mail size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Email</span>
                <CommandShortcut>E</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/agent')}>
                <Bot size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Agente</span>
                <CommandShortcut>A</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Criar">
              <CommandItem onSelect={() => navigate('/tasks?create=true')}>
                <Plus size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Nova tarefa</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate('/notes?create=true')}>
                <StickyNote size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 13 }}>Nova nota</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  )
}

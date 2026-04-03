'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

const sectionLabels: Record<string, string> = {
  '/tasks': 'Tarefas',
  '/calendar': 'Calendário',
  '/projects': 'Projetos',
  '/notes': 'Notas',
  '/email': 'Email',
  '/agent': 'Agente',
}

function getSectionLabel(pathname: string): string {
  for (const [path, label] of Object.entries(sectionLabels)) {
    if (pathname.startsWith(path)) return label
  }
  return 'Santiago OS'
}

interface TopbarProps {
  onOpenCommandPalette: () => void
}

export function Topbar({ onOpenCommandPalette }: TopbarProps) {
  const pathname = usePathname()
  const label = getSectionLabel(pathname)

  const isMac = useCallback(() => {
    if (typeof navigator === 'undefined') return false
    return navigator.platform?.toUpperCase().includes('MAC') ?? false
  }, [])

  return (
    <header className="topbar">
      <span className="topbar__title">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenCommandPalette}
        className="topbar__shortcut"
      >
        <kbd className="topbar__kbd">{isMac() ? '\u2318' : 'Ctrl'}</kbd>
        <kbd className="topbar__kbd">K</kbd>
      </Button>
    </header>
  )
}

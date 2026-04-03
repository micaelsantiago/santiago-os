'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

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
    <header
      className="flex items-center justify-between px-4"
      style={{
        height: 'var(--topbar-height)',
        minHeight: 'var(--topbar-height)',
        backgroundColor: 'var(--color-bg)',
        borderBottom: '0.5px solid var(--color-border-app)',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-text)',
        }}
      >
        {label}
      </span>

      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-1.5"
        style={{
          fontSize: 11,
          fontWeight: 400,
          color: 'var(--color-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-3)'
        }}
      >
        <kbd
          style={{
            fontSize: 11,
            fontFamily: 'var(--font)',
            color: 'inherit',
            padding: '1px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '0.5px solid var(--color-border-app)',
            backgroundColor: 'var(--color-bg-2)',
          }}
        >
          {isMac() ? '\u2318' : 'Ctrl'}
        </kbd>
        <kbd
          style={{
            fontSize: 11,
            fontFamily: 'var(--font)',
            color: 'inherit',
            padding: '1px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '0.5px solid var(--color-border-app)',
            backgroundColor: 'var(--color-bg-2)',
          }}
        >
          K
        </kbd>
      </button>
    </header>
  )
}

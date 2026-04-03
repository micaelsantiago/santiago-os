'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  FileText,
  Mail,
  Bot,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const navItems: NavItem[] = [
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/calendar', icon: Calendar, label: 'Calendário' },
  { href: '/projects', icon: FolderKanban, label: 'Projetos' },
  { href: '/notes', icon: FileText, label: 'Notas' },
  { href: '/email', icon: Mail, label: 'Email' },
  { href: '/agent', icon: Bot, label: 'Agente' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col items-center gap-1 pt-2"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        borderRight: '0.5px solid var(--color-border-app)',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius)',
              backgroundColor: isActive ? 'var(--color-accent-bg)' : 'transparent',
              color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-3)',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-text-2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-text-3)'
              }
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
          </Link>
        )
      })}
    </aside>
  )
}

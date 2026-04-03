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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
    <TooltipProvider delay={300}>
      <aside className="sidebar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  />
                }
              >
                <Icon size={16} strokeWidth={1.5} />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </aside>
    </TooltipProvider>
  )
}

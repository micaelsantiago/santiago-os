'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, Calendar, FolderKanban, FileText, Mail, Bot, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Module } from '@/lib/rbac'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  module: Module
}

const navItems: NavItem[] = [
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas', module: 'tasks' },
  { href: '/calendar', icon: Calendar, label: 'Calendário', module: 'calendar' },
  { href: '/projects', icon: FolderKanban, label: 'Projetos', module: 'projects' },
  { href: '/notes', icon: FileText, label: 'Notas', module: 'notes' },
  { href: '/email', icon: Mail, label: 'Email', module: 'email' },
  { href: '/agent', icon: Bot, label: 'Agente', module: 'agent' },
]

interface SidebarProps {
  allowedModules: Module[]
  isMaster: boolean
}

export function Sidebar({ allowedModules, isMaster }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) => allowedModules.includes(item.module))

  return (
    <TooltipProvider delay={300}>
      <aside className="sidebar">
        <div className="sidebar__nav">
          {visibleItems.map((item) => {
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
        </div>
        {isMaster && (
          <div className="sidebar__footer">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/settings/members"
                    className={`sidebar__link ${pathname.startsWith('/settings') ? 'sidebar__link--active' : ''}`}
                  />
                }
              >
                <Settings size={16} strokeWidth={1.5} />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Configurações
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}

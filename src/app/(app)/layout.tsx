'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { CommandPalette } from '@/components/layout/CommandPalette'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])

  return (
    <div className="flex h-screen" style={{ fontFamily: 'var(--font)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onOpenCommandPalette={handleOpenCommandPalette} />
        <main
          className="flex-1 overflow-auto p-4"
          style={{ backgroundColor: 'var(--color-bg-3)' }}
        >
          {children}
        </main>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  )
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>
}

import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'
import { CommandPalette } from '@/components/CommandPalette'
import { useTheme } from '@/hooks/useTheme'

export function Shell() {
  useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen((o) => !o)
    }
    if (e.key === 'Escape') setMobileSidebarOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Close mobile drawer whenever viewport becomes ≥ md
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const close = (e: MediaQueryListEvent) => { if (e.matches) setMobileSidebarOpen(false) }
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar — always mounted, CSS transition handles width */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <Sidebar
              className="fixed inset-y-0 left-0 z-50 flex shadow-2xl animate-in slide-in-from-left duration-200"
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

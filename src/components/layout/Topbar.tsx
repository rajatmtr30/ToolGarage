import { Moon, Sun, Monitor, PanelLeft, Command, Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useUIStore } from '@/store/uiStore'

interface TopbarProps {
  onOpenPalette: () => void
  onOpenMobileSidebar: () => void
}

export function Topbar({ onOpenPalette, onOpenMobileSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-3">
      {/* Mobile: hamburger opens drawer */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobileSidebar}
        className="h-8 w-8 md:hidden"
        title="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop: toggle sidebar panel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden h-8 w-8 md:flex"
        title="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      {/* Logo / brand — links back to the dashboard */}
      <NavLink
        to="/"
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent transition-colors"
        title="ToolGarage — go to dashboard"
      >
        <img src="/ToolGarage-logo.png" alt="ToolGarage" className="h-6 w-auto shrink-0 object-contain" />
        <span className="font-semibold text-sm tracking-tight">ToolGarage</span>
        <span className="hidden lg:inline text-[10px] text-muted-foreground font-medium leading-none">
          Developer Toolkit
        </span>
      </NavLink>

      <div className="flex-1" />

      {/* Search palette — icon-only on mobile, labelled on sm+ */}
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenPalette}
        className="h-8 gap-1.5 text-muted-foreground text-xs px-2 sm:px-3"
        title="Find any tool (Ctrl+K)"
      >
        <Command className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Find a tool…</span>
        <kbd className="pointer-events-none hidden select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        className="h-8 w-8"
        title={`Theme: ${theme}`}
      >
        <ThemeIcon className="h-4 w-4" />
      </Button>
    </header>
  )
}

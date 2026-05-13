import { NavLink } from 'react-router-dom'
import {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe, ChevronDown, Home, X,
} from 'lucide-react'
import { useState } from 'react'
import { TOOLS, TOOL_CATEGORIES } from '@/routes'
import { useUIStore } from '@/store/uiStore'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { ToolDefinition } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe,
}

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return <span className={cn('h-4 w-4', className)} />
  return <Icon className={cn('h-4 w-4', className)} />
}

function ToolItem({ tool, onClose }: { tool: ToolDefinition; onClose?: () => void }) {
  const { addRecentTool } = useUIStore()
  return (
    <NavLink
      to={tool.path}
      onClick={() => {
        addRecentTool(tool.id)
        trackEvent('Tool', 'Click_Sidebar', tool.name)
        onClose?.()
      }}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <ToolIcon name={tool.icon} className="shrink-0" />
      <span className="truncate">{tool.name}</span>
    </NavLink>
  )
}

function CategorySection({ category, onClose }: { category: string; onClose?: () => void }) {
  const [open, setOpen] = useState(true)
  const tools = TOOLS.filter((t) => t.category === category)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {category}
        <ChevronDown className={cn('h-3 w-3 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {tools.map((tool) => (
            <ToolItem key={tool.id} tool={tool} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const { sidebarCollapsed } = useUIStore()

  // Mobile mode (onClose provided): always full width.
  // Desktop mode: animate between w-64 and w-0 so the sidebar is never removed from the DOM.
  const collapsed = !onClose && sidebarCollapsed

  return (
    <aside
      className={cn(
        'shrink-0 flex-col border-r border-border bg-background overflow-hidden transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-0 border-r-0' : 'w-64',
        className
      )}
    >
      {/* Mobile drawer header */}
      {onClose && (
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-1.5 font-semibold text-sm"
          >
            <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5 shrink-0">
              <rect width="32" height="32" rx="8" fill="#6366f1" />
              <path d="M8 12L13 16L8 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 20H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            ToolGarage
          </NavLink>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dashboard link */}
      <div className={cn('px-2', onClose ? 'pt-2' : 'pt-3')}>
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Dashboard</span>
        </NavLink>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-4 px-2 pb-2">
          {TOOL_CATEGORIES.map((cat) => (
            <CategorySection key={cat} category={cat} onClose={onClose} />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border px-3 py-2">
        <p className="text-[10px] text-muted-foreground mb-1">ToolGarage v1.0 · runs entirely in your browser</p>
        <p className="text-[10px] text-muted-foreground font-medium">Developed by Rajat Sharma</p>
      </div>
    </aside>
  )
}

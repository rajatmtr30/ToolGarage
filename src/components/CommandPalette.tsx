import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe,
} from 'lucide-react'
import { TOOLS, TOOL_CATEGORIES } from '@/routes'
import { useUIStore } from '@/store/uiStore'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe,
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { addRecentTool } = useUIStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  if (!open) return null

  const handleSelect = (path: string, id: string) => {
    addRecentTool(id)
    const tool = TOOLS.find((t) => t.id === id)
    if (tool) {
      trackEvent('Tool', 'Select_CommandPalette', tool.name)
    }
    navigate(path)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              autoFocus
              placeholder="Type a tool name, e.g. JSON, JWT, UUID, AES…"
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="pointer-events-none hidden select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-72 overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No matching tool. Try a keyword like format, encode, hash, or convert.
            </Command.Empty>
            {TOOL_CATEGORIES.map((category) => {
              const tools = TOOLS.filter((t) => t.category === category)
              return (
                <Command.Group key={category} heading={category}>
                  {tools.map((tool) => {
                    const Icon = ICON_MAP[tool.icon]
                    return (
                      <Command.Item
                        key={tool.id}
                        value={`${tool.name} ${tool.keywords?.join(' ')}`}
                        onSelect={() => handleSelect(tool.path, tool.id)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm cursor-pointer',
                          'aria-selected:bg-accent aria-selected:text-accent-foreground'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <span>{tool.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground truncate max-w-[160px]">
                          {tool.description}
                        </span>
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              )
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

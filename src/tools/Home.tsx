import { NavLink } from 'react-router-dom'
import {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe,
  Command, ShieldCheck as PrivacyIcon, Zap, History, ChevronRight,
} from 'lucide-react'
import { TOOLS, TOOL_CATEGORIES } from '@/routes'
import { useUIStore } from '@/store/uiStore'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { ToolDefinition, ToolCategory } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces, Code2, AlignLeft, Database, GitBranch, SplitSquareHorizontal,
  Binary, Link, KeyRound, CaseSensitive, Lock, ShieldCheck, Fingerprint,
  Hash, Dices, FileText, QrCode, Palette, Clock, CalendarClock,
  ArrowLeftRight, Regex, Globe,
}

const CATEGORY_META: Record<ToolCategory, {
  color: string
  bg: string
  border: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  Formatters: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    description: 'Pretty-print, validate and tidy up code files',
    icon: Braces,
  },
  Viewers: {
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    border: 'border-violet-200/60 dark:border-violet-800/40',
    description: 'Visualize diagrams and compare text side-by-side',
    icon: SplitSquareHorizontal,
  },
  Encoders: {
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    border: 'border-cyan-200/60 dark:border-cyan-800/40',
    description: 'Encode, decode and transform text between formats',
    icon: Binary,
  },
  Crypto: {
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    description: 'Encrypt, hash and sign — all processed locally',
    icon: Lock,
  },
  Generators: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    description: 'Generate IDs, mock data, QR codes and colors',
    icon: Dices,
  },
  Converters: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    description: 'Convert timestamps, case styles and text formats',
    icon: ArrowLeftRight,
  },
  Testers: {
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50',
    border: 'border-fuchsia-200/60 dark:border-fuchsia-800/40',
    description: 'Test regex patterns and fire HTTP requests',
    icon: Globe,
  },
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const { addRecentTool } = useUIStore()
  const Icon = ICON_MAP[tool.icon] ?? Braces
  const meta = CATEGORY_META[tool.category]

  return (
    <NavLink
      to={tool.path}
      onClick={() => {
        addRecentTool(tool.id)
        trackEvent('Tool', 'Click_Home', tool.name)
      }}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:translate-y-0"
    >
      <div
        className={cn(
          'shrink-0 rounded-lg p-2.5 transition-colors',
          meta?.bg ?? 'bg-primary/10'
        )}
      >
        <Icon className={cn('h-4 w-4', meta?.color ?? 'text-primary')} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-foreground">{tool.name}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{tool.description}</p>
      </div>
      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground/70" />
    </NavLink>
  )
}

function StatChip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </div>
  )
}

export default function Home() {
  const { recentTools } = useUIStore()
  const recentToolObjects = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-background to-violet-500/8 px-5 py-7 sm:px-8 sm:py-10">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Logo mark */}
          <div className="w-fit shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-primary/30">
            <img src="/toolgarage-full-logo.png" alt="ToolGarage Logo" className="h-16 w-auto sm:h-20 object-contain" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">ToolGarage</h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your all-in-one offline developer workspace — every utility you reach for, instantly available in your browser. No installs, no sign-ups, no data ever leaves your tab.
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
            <PrivacyIcon className="h-3.5 w-3.5 shrink-0" />
            100% offline — your data never leaves this tab
          </div>
          <StatChip icon={Command}>Ctrl+K to search all tools</StatChip>
          <StatChip icon={Zap}>{TOOLS.length} tools across {TOOL_CATEGORIES.length} workbenches</StatChip>
        </div>
      </div>

      {/* ── Recent tools ─────────────────────────────────────── */}
      {recentToolObjects.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <History className="h-4 w-4 text-muted-foreground" />
              Recently used
            </h2>
            <span className="text-xs text-muted-foreground">{recentToolObjects.length} tool{recentToolObjects.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentToolObjects.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* ── Workbenches ──────────────────────────────────────── */}
      {TOOL_CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category)
        const meta = CATEGORY_META[category]
        const CatIcon = meta?.icon ?? Braces

        return (
          <section key={category}>
            {/* Section header */}
            <div className="mb-3 flex items-center gap-3">
              <div className={cn('rounded-lg border p-2', meta?.bg, meta?.border)}>
                <CatIcon className={cn('h-4 w-4', meta?.color)} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-tight text-foreground">{category}</h2>
                <p className="text-xs text-muted-foreground">{meta?.description}</p>
              </div>
              <div className="ml-auto flex-shrink-0 text-xs text-muted-foreground">
                {tools.length} tool{tools.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

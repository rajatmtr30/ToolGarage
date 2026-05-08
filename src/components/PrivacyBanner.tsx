import { ShieldCheck } from 'lucide-react'

export function PrivacyBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
      <ShieldCheck className="h-4 w-4 shrink-0" />
      <span>
        Local-only: this tool runs entirely in your browser. Keys, secrets and inputs never leave the page and are not stored.
      </span>
    </div>
  )
}

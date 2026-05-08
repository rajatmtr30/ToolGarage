import { useState } from 'react'
import cronstrue from 'cronstrue'
import { parseExpression } from 'cron-parser'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface NextRun {
  date: Date
  relative: string
}

function getNextRuns(expression: string, count = 5): NextRun[] {
  try {
    const interval = parseExpression(expression)
    const runs: NextRun[] = []
    for (let i = 0; i < count; i++) {
      const date = interval.next().toDate()
      const diff = date.getTime() - Date.now()
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days = Math.floor(hours / 24)
      const relative = days > 0 ? `in ${days}d ${hours % 24}h` : hours > 0 ? `in ${hours}h ${mins % 60}m` : `in ${mins}m`
      runs.push({ date, relative })
    }
    return runs
  } catch {
    return []
  }
}

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every Monday 9am', value: '0 9 * * 1' },
  { label: 'Every weekday', value: '0 9 * * 1-5' },
  { label: 'First day of month', value: '0 0 1 * *' },
  { label: 'Every Sunday midnight', value: '0 0 * * 0' },
]

export default function CronTool() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')
  const [nextRuns, setNextRuns] = useState<NextRun[]>([])

  const explain = (expr: string) => {
    setError('')
    if (!expr.trim()) { setExplanation(''); setNextRuns([]); return }
    try {
      const text = cronstrue.toString(expr, { throwExceptionOnParseError: true, verbose: true })
      setExplanation(text)
      setNextRuns(getNextRuns(expr))
    } catch (e) {
      setError(e instanceof Error ? e.message : "That doesn't look like a valid cron expression. Expected 5 space-separated fields.")
      setExplanation('')
      setNextRuns([])
    }
  }

  const handleChange = (v: string) => {
    setExpression(v)
    explain(v)
  }

  const parts = expression.trim().split(/\s+/)
  const partLabels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week']

  return (
    <div className="flex h-full flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Cron Builder</h1>
        <p className="text-xs text-muted-foreground">Write a cron expression and instantly see what it means in plain English, plus the next 5 fire times.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label>Your cron expression</Label>
          <CopyButton text={expression} size="sm" />
        </div>
        <Input
          value={expression}
          onChange={(e) => handleChange(e.target.value)}
          className="font-mono text-lg h-11 tracking-widest"
          placeholder="* * * * *  (minute hour day-of-month month day-of-week)"
          spellCheck={false}
        />
        {parts.length === 5 && (
          <div className="grid grid-cols-5 gap-2 mt-1">
            {parts.map((part, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-xs font-semibold text-primary">{part}</span>
                <span className="text-[10px] text-muted-foreground">{partLabels[i]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {explanation && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/20 px-4 py-3">
          <span className="text-sm font-medium">{explanation}</span>
        </div>
      )}
      {error && <Badge variant="destructive">{error}</Badge>}

      {nextRuns.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Next 5 fire times (in your local timezone)</Label>
          <div className="rounded-md border border-border overflow-hidden">
            {nextRuns.map((run, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-border last:border-0 text-sm hover:bg-muted/20">
                <span className="font-mono">{run.date.toLocaleString()}</span>
                <Badge variant="outline" className="text-xs">{run.relative}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Quick presets — click to use</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={expression === p.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange(p.value)}
              className="gap-2"
            >
              <span className="font-mono text-xs">{p.value}</span>
              <span className="text-xs opacity-70">{p.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

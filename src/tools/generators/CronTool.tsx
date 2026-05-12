import { useState } from 'react'
import cronstrue from 'cronstrue'
import { parseExpression } from 'cron-parser'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

function parseNlToCron(input: string): string | null {
  const s = input.toLowerCase().trim()
  if (!s) return null
  if (s === 'every minute') return '* * * * *'
  const minMatch = s.match(/^every (\d+) minutes?$/)
  if (minMatch) return `*/${minMatch[1]} * * * *`
  if (s === 'every hour') return '0 * * * *'
  const hrMatch = s.match(/^every (\d+) hours?$/)
  if (hrMatch) return `0 */${hrMatch[1]} * * * *`

  let min = '0', hour = '*', dom = '*', mon = '*', dow = '*'
  let foundTime = false

  const timeMatch = s.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)
  if (timeMatch) {
    let h = parseInt(timeMatch[1])
    const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const ampm = timeMatch[3]
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    hour = h.toString()
    min = m.toString()
    foundTime = true
  } else if (s.includes('noon')) {
    hour = '12'; min = '0'; foundTime = true
  } else if (s.includes('midnight')) {
    hour = '0'; min = '0'; foundTime = true
  }

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  for (let i = 0; i < days.length; i++) {
    if (s.includes(days[i])) { dow = i.toString(); break }
  }
  if (s.includes('weekday')) dow = '1-5'
  if (s.includes('weekend')) dow = '0,6'

  if (s.includes('day') || s.includes('daily')) {
    if (hour === '*') hour = '0'
  }

  if (foundTime || dow !== '*' || s.includes('day') || s.includes('daily')) {
    if (hour === '*') hour = '0'
    return `${min} ${hour} ${dom} ${mon} ${dow}`
  }

  return null
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

function CronVisualBuilder({ expression, setExpression }: { expression: string, setExpression: (v: string) => void }) {
  const parts = expression.trim().split(/\s+/)
  const [min, hour, dom, mon, dow] = parts.length === 5 ? parts : ['*', '*', '*', '*', '*']

  const update = (index: number, val: string) => {
    const newParts = [...parts.length === 5 ? parts : ['*', '*', '*', '*', '*']]
    newParts[index] = val
    setExpression(newParts.join(' '))
  }

  const mins = ['*', ...Array.from({ length: 60 }, (_, i) => String(i)), '*/5', '*/10', '*/15', '*/30']
  const hours = ['*', ...Array.from({ length: 24 }, (_, i) => String(i))]
  const doms = ['*', ...Array.from({ length: 31 }, (_, i) => String(i + 1))]
  const mons = ['*', ...Array.from({ length: 12 }, (_, i) => String(i + 1))]
  const dows = ['*', '0', '1', '2', '3', '4', '5', '6', '1-5', '0,6']
  
  const dowLabels: Record<string, string> = { '*': 'Every day (*)', '0': 'Sun (0)', '1': 'Mon (1)', '2': 'Tue (2)', '3': 'Wed (3)', '4': 'Thu (4)', '5': 'Fri (5)', '6': 'Sat (6)', '1-5': 'Mon-Fri (1-5)', '0,6': 'Weekend (0,6)' }
  const monLabels: Record<string, string> = { '*': 'Every month (*)', '1': 'Jan (1)', '2': 'Feb (2)', '3': 'Mar (3)', '4': 'Apr (4)', '5': 'May (5)', '6': 'Jun (6)', '7': 'Jul (7)', '8': 'Aug (8)', '9': 'Sep (9)', '10': 'Oct (10)', '11': 'Nov (11)', '12': 'Dec (12)' }

  return (
    <div className="grid grid-cols-5 gap-3 p-4 rounded-md border border-border bg-muted/10">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Minute</Label>
        <Select value={mins.includes(min) ? min : '*'} onValueChange={v => update(0, v)}>
          <SelectTrigger className="font-mono text-xs h-9 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {mins.map(m => <SelectItem key={m} value={m} className="font-mono text-xs">{m === '*' ? 'Every min (*)' : m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Hour</Label>
        <Select value={hours.includes(hour) ? hour : '*'} onValueChange={v => update(1, v)}>
          <SelectTrigger className="font-mono text-xs h-9 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {hours.map(h => <SelectItem key={h} value={h} className="font-mono text-xs">{h === '*' ? 'Every hour (*)' : h}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Day</Label>
        <Select value={doms.includes(dom) ? dom : '*'} onValueChange={v => update(2, v)}>
          <SelectTrigger className="font-mono text-xs h-9 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {doms.map(d => <SelectItem key={d} value={d} className="font-mono text-xs">{d === '*' ? 'Every day (*)' : d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Month</Label>
        <Select value={mons.includes(mon) ? mon : '*'} onValueChange={v => update(3, v)}>
          <SelectTrigger className="font-mono text-xs h-9 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {mons.map(m => <SelectItem key={m} value={m} className="font-mono text-xs">{monLabels[m] || m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Weekday</Label>
        <Select value={dows.includes(dow) ? dow : '*'} onValueChange={v => update(4, v)}>
          <SelectTrigger className="font-mono text-xs h-9 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {dows.map(d => <SelectItem key={d} value={d} className="font-mono text-xs">{dowLabels[d] || d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default function CronTool() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [nlInput, setNlInput] = useState('')
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

  const handleNlChange = (v: string) => {
    setNlInput(v)
    const cron = parseNlToCron(v)
    if (cron) {
      setExpression(cron)
      explain(cron)
    } else {
      setError("Couldn't understand that schedule. Try something like 'every monday at 9am' or 'every 5 minutes'.")
      setExplanation('')
      setNextRuns([])
    }
  }

  const parts = expression.trim().split(/\s+/)
  const partLabels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week']

  return (
    <div className="flex h-full flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Cron Builder</h1>
        <p className="text-xs text-muted-foreground">Write a cron expression and instantly see what it means in plain English, plus the next 5 fire times.</p>
      </div>

      <Tabs defaultValue="visual" className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <TabsList className="h-8">
            <TabsTrigger value="visual" className="text-xs">Visual Builder</TabsTrigger>
            <TabsTrigger value="magic" className="text-xs">Magic Input (NL)</TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">Manual Entry</TabsTrigger>
          </TabsList>
          <CopyButton text={expression} size="sm" />
        </div>
        
        <TabsContent value="visual" className="mt-0">
          <CronVisualBuilder expression={expression} setExpression={handleChange} />
        </TabsContent>
        
        <TabsContent value="manual" className="mt-0">
          <div className="flex flex-col gap-1">
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
        </TabsContent>
        
        <TabsContent value="magic" className="mt-0">
          <div className="flex flex-col gap-2 p-4 rounded-md border border-border bg-muted/10">
            <Label>Type a schedule in plain English</Label>
            <Input
              value={nlInput}
              onChange={(e) => handleNlChange(e.target.value)}
              className="text-sm"
              placeholder="e.g. 'every weekday at 5pm' or 'every 15 minutes'"
              spellCheck={false}
            />
            <span className="text-xs text-muted-foreground mt-1">We'll try to convert it to a cron expression instantly. Supported: times (5pm), days (monday, weekday), intervals (every 5 minutes).</span>
          </div>
        </TabsContent>
      </Tabs>

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

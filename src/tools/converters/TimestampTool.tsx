import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'

dayjs.extend(utc)
dayjs.extend(timezone)

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
]

function formatRow(label: string, value: string) {
  return { label, value }
}

function MultiTzTable({ date }: { date: dayjs.Dayjs }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-muted/10 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Timezone</th>
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Local Date & Time</th>
            <th className="text-right px-3 py-2 font-semibold text-muted-foreground">UTC Offset</th>
          </tr>
        </thead>
        <tbody>
          {COMMON_TIMEZONES.map(tz => {
            const d = date.tz(tz)
            return (
              <tr key={tz} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{tz}</td>
                <td className="px-3 py-2 font-mono">{d.format('ddd, DD MMM YYYY HH:mm:ss')}</td>
                <td className="px-3 py-2 font-mono text-right text-muted-foreground">{d.format('Z')}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DurationCalculator() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  
  const parseDate = (v: string) => {
    if (!v.trim()) return null
    if (/^\d+$/.test(v.trim())) {
      const ms = v.length <= 10 ? parseInt(v) * 1000 : parseInt(v)
      return dayjs(ms)
    }
    const d = dayjs(v.trim())
    return d.isValid() ? d : null
  }

  const d1 = parseDate(start)
  const d2 = parseDate(end)

  return (
    <div className="flex flex-col gap-4 p-4 rounded-md border border-border bg-muted/10">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Start time</Label>
          <Input value={start} onChange={e => setStart(e.target.value)} placeholder="Epoch or date string" className="font-mono text-sm" />
          {start && !d1 && <span className="text-xs text-destructive">Invalid date</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>End time</Label>
          <Input value={end} onChange={e => setEnd(e.target.value)} placeholder="Epoch or date string" className="font-mono text-sm" />
          {end && !d2 && <span className="text-xs text-destructive">Invalid date</span>}
        </div>
      </div>
      {d1 && d2 && (
        <div className="flex flex-col gap-2 mt-2">
          {(() => {
            const diffMs = Math.abs(d2.valueOf() - d1.valueOf())
            const secs = Math.floor(diffMs / 1000)
            const mins = Math.floor(diffMs / 60000)
            const hours = Math.floor(diffMs / 3600000)
            const days = Math.floor(diffMs / 86400000)
            return (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-md border border-border">
                  <div className="font-mono text-2xl font-semibold">{days}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Days</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-md border border-border">
                  <div className="font-mono text-2xl font-semibold">{hours}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Hours</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-md border border-border">
                  <div className="font-mono text-2xl font-semibold">{mins}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Minutes</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-md border border-border">
                  <div className="font-mono text-2xl font-semibold">{secs}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Seconds</div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default function TimestampTool() {
  const [epochInput, setEpochInput] = useState(String(Date.now()))
  const [isoInput, setIsoInput] = useState('')
  const [tz, setTz] = useState('Asia/Kolkata')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fromEpoch = () => {
    const ms = epochInput.length <= 10 ? parseInt(epochInput) * 1000 : parseInt(epochInput)
    if (isNaN(ms)) return null
    return dayjs(ms)
  }

  const fromIso = () => {
    if (!isoInput.trim()) return null
    const d = dayjs(isoInput.trim())
    return d.isValid() ? d : null
  }

  const epochDate = fromEpoch()
  const isoDate = fromIso()

  const renderConversions = (d: dayjs.Dayjs | null) => {
    if (!d) return []
    return [
      formatRow('Epoch (ms)', String(d.valueOf())),
      formatRow('Epoch (s)', String(Math.floor(d.valueOf() / 1000))),
      formatRow('ISO 8601', d.utc().toISOString()),
      formatRow('UTC', d.utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')),
      formatRow(tz, d.tz(tz).format('ddd, DD MMM YYYY HH:mm:ss z')),
      formatRow('Relative', (() => {
        const diff = d.valueOf() - Date.now()
        const abs = Math.abs(diff)
        const secs = Math.floor(abs / 1000)
        const mins = Math.floor(secs / 60)
        const hours = Math.floor(mins / 60)
        const days = Math.floor(hours / 24)
        const suffix = diff > 0 ? 'from now' : 'ago'
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${suffix}`
        if (hours > 0) return `${hours}h ${mins % 60}m ${suffix}`
        if (mins > 0) return `${mins}m ${secs % 60}s ${suffix}`
        return `${secs}s ${suffix}`
      })()),
    ]
  }

  return (
    <div className="flex h-full flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Time Machine</h1>
        <p className="text-xs text-muted-foreground">Hop between Unix epoch, ISO 8601 and any timezone — with handy "X minutes ago" hints.</p>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-muted/30 border border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">Right now:</span>
        <span className="font-mono text-sm">{dayjs(now).utc().toISOString()}</span>
        <span className="font-mono text-xs text-muted-foreground">(epoch s: {Math.floor(now / 1000)})</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto" onClick={() => setEpochInput(String(now))} title="Drop the current time into the From Epoch box">
          Use this time
        </Button>
      </div>

      <Tabs defaultValue="converters" className="flex flex-col gap-4">
        <TabsList className="w-fit flex-wrap">
          <TabsTrigger value="converters">Converters</TabsTrigger>
          <TabsTrigger value="calculator">Duration Calculator</TabsTrigger>
          <TabsTrigger value="table">Multi-Timezone Table</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converters" className="mt-0 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Show date in this timezone</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-md border border-border bg-muted/10">
              <h3 className="text-sm font-medium">Have a Unix timestamp?</h3>
              <div className="flex gap-2">
                <Input
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder="Paste epoch in s or ms"
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={() => setEpochInput(String(Date.now()))} title="Reset to current time">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
              {epochDate && !epochDate.isValid() ? (
                <Badge variant="destructive">That's not a valid epoch number</Badge>
              ) : epochDate && (
                <div className="flex flex-col gap-0.5 mt-2">
                  {renderConversions(epochDate).map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 group">
                      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                      <span className="font-mono text-xs flex-1 truncate">{value}</span>
                      <CopyButton text={value} size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-md border border-border bg-muted/10">
              <h3 className="text-sm font-medium">Have a date string?</h3>
              <Input
                value={isoInput}
                onChange={(e) => setIsoInput(e.target.value)}
                placeholder="ISO 8601, RFC 2822..."
                className="font-mono text-sm"
              />
              {isoInput && !isoDate ? (
                <Badge variant="destructive" className="mt-2 w-fit">Couldn't parse this date</Badge>
              ) : isoDate && (
                <div className="flex flex-col gap-0.5 mt-2">
                  {renderConversions(isoDate).map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 group">
                      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                      <span className="font-mono text-xs flex-1 truncate">{value}</span>
                      <CopyButton text={value} size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="calculator" className="mt-0">
          <DurationCalculator />
        </TabsContent>

        <TabsContent value="table" className="mt-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <Label>Base time (Epoch ms):</Label>
            <Input value={epochInput} onChange={(e) => setEpochInput(e.target.value)} placeholder="Epoch in ms" className="w-48 h-8 font-mono text-sm" />
            <span className="text-xs text-muted-foreground ml-2">Tip: Parse ISO strings in the Converters tab.</span>
          </div>
          {epochDate && epochDate.isValid() ? (
             <MultiTzTable date={epochDate} />
          ) : (
             <div className="text-sm text-destructive">Invalid epoch time</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

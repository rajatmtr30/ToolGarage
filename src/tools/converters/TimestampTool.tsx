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
              placeholder="Paste epoch in seconds or milliseconds — we figure it out"
              className="font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={() => setEpochInput(String(Date.now()))} title="Reset to current time">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          {epochDate && !epochDate.isValid() ? (
            <Badge variant="destructive">That's not a valid epoch number</Badge>
          ) : epochDate && (
            <div className="flex flex-col gap-0.5">
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
            placeholder="ISO 8601, RFC 2822, or anything dayjs understands"
            className="font-mono text-sm"
          />
          {isoInput && !isoDate ? (
            <Badge variant="destructive">Couldn't parse this date</Badge>
          ) : isoDate && (
            <div className="flex flex-col gap-0.5">
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
    </div>
  )
}

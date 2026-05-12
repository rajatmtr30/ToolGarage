import { useState } from 'react'
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { ulid } from 'ulid'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Trash2 } from 'lucide-react'

const nanoidAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
function nanoid(size = 21) {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  let id = ''
  for (let i = 0; i < size; i++) {
    id += nanoidAlphabet[bytes[i] & 63]
  }
  return id
}

type IdType = 'uuid-v1' | 'uuid-v4' | 'uuid-v7' | 'ulid' | 'nanoid'

function generate(type: IdType): string {
  switch (type) {
    case 'uuid-v1': return uuidv1()
    case 'uuid-v4': return uuidv4()
    case 'uuid-v7': return uuidv7()
    case 'ulid': return ulid()
    case 'nanoid': return nanoid()
  }
}

export default function UuidTool() {
  const [type, setType] = useState<IdType>('uuid-v4')
  const [count, setCount] = useState('5')
  const [ids, setIds] = useState<string[]>([])
  const [uppercase, setUppercase] = useState(false)

  const handleGenerate = () => {
    const n = Math.min(100, Math.max(1, parseInt(count) || 1))
    setIds(Array.from({ length: n }, () => {
      const id = generate(type)
      return uppercase ? id.toUpperCase() : id
    }))
  }

  const formatted = ids.map((id) => uppercase ? id.toUpperCase() : id)

  const TYPE_DESCRIPTIONS: Record<IdType, string> = {
    'uuid-v1': 'UUID v1 — embeds the current timestamp + machine info. Sortable but leaks when/where it was generated.',
    'uuid-v4': 'UUID v4 — fully random and the safe default for most apps. 122 bits of entropy.',
    'uuid-v7': 'UUID v7 — time-ordered UUID. Combines a timestamp with random data for better DB locality.',
    'ulid': 'ULID — 26-char, lexicographically sortable, URL-safe. Great for primary keys you want sorted by time.',
    'nanoid': 'NanoID — 21-char, URL-safe string. Compact and fast, great for public IDs.',
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">ID Generator</h1>
        <p className="text-xs text-muted-foreground">Mint UUID v1 / v4 and ULID identifiers — single or in bulk.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Identifier type</Label>
          <Select value={type} onValueChange={(v) => setType(v as IdType)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uuid-v4">UUID v4 — random</SelectItem>
              <SelectItem value="uuid-v7">UUID v7 — time-ordered</SelectItem>
              <SelectItem value="uuid-v1">UUID v1 — time-based</SelectItem>
              <SelectItem value="ulid">ULID — sortable</SelectItem>
              <SelectItem value="nanoid">NanoID — compact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>How many? (1–100)</Label>
          <Input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} className="w-24" />
        </div>
        <Button onClick={handleGenerate} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate IDs
        </Button>
        {ids.length > 0 && (
          <>
            <Button variant="outline" onClick={() => setUppercase((v) => !v)} title="Toggle letter case">
              {uppercase ? 'Showing UPPERCASE' : 'Showing lowercase'}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIds([])} title="Clear results">
              <Trash2 className="h-4 w-4" />
            </Button>
            <CopyButton text={formatted.join('\n')} size="sm" />
          </>
        )}
      </div>

      {type && (
        <p className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
      )}

      {formatted.length > 0 && (
        <div className="flex flex-col rounded-md border border-border overflow-hidden">
          {formatted.map((id, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 font-mono text-sm group"
            >
              <span>{id}</span>
              <CopyButton text={id} size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" />
            </div>
          ))}
        </div>
      )}

      {ids.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Hit "Generate IDs" to mint your first batch.</p>
            <p className="text-muted-foreground text-xs mt-1">Preview: <span className="font-mono">{generate(type)}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

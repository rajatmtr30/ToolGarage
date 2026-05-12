import React, { useState, useMemo } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { explainRegex } from '@/lib/regexExplainer'

interface Match {
  index: number
  length: number
  match: string
  groups: Record<string, string | undefined>
}

const PRESETS = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { label: 'Phone (IN)', pattern: '[6-9]\\d{9}' },
  { label: 'Date (DD/MM/YYYY)', pattern: '\\b(0[1-9]|[12]\\d|3[01])/(0[1-9]|1[0-2])/\\d{4}\\b' },
  { label: 'JWT', pattern: '[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}' },
  { label: 'Hex color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b' },
]

const SAMPLE_TEXT = `Contact us at support@example.com or admin@toolgarage.io
Visit https://toolgarage.example.com/tools for more info
User IP: 192.168.1.100 (internal) or 10.0.0.1
Phone: 9876543210
Date: 01/06/2026 to 31/12/2026`

function highlightMatches(text: string, matches: Match[]): React.ReactNode[] {
  if (!matches.length) return [text]
  const parts: React.ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 rounded-sm px-0.5">{m.match}</mark>
    )
    last = m.index + m.length
  })
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')
  const [flags, setFlags] = useState({ global: true, ignoreCase: false, multiline: false })
  const [testText, setTestText] = useState(SAMPLE_TEXT)
  const [replacement, setReplacement] = useState('')

  const flagStr = [flags.global ? 'g' : '', flags.ignoreCase ? 'i' : '', flags.multiline ? 'm' : ''].filter(Boolean).join('')

  const { matches, error, regex } = useMemo(() => {
    if (!pattern) return { matches: [], error: '', regex: null }
    try {
      const re = new RegExp(pattern, flagStr)
      const ms: Match[] = []
      let m: RegExpExecArray | null
      const src = flags.global ? testText : testText
      if (flags.global) {
        re.lastIndex = 0
        while ((m = re.exec(src)) !== null) {
          const groups = m.groups ? Object.fromEntries(Object.entries(m.groups)) : {}
          ms.push({ index: m.index, length: m[0].length, match: m[0], groups })
          if (!flags.global) break
        }
      } else {
        m = re.exec(src)
        if (m) {
          const groups = m.groups ? Object.fromEntries(Object.entries(m.groups)) : {}
          ms.push({ index: m.index, length: m[0].length, match: m[0], groups })
        }
      }
      return { matches: ms, error: '', regex: re }
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "That regex doesn't compile — check brackets and escapes.", regex: null }
    }
  }, [pattern, flagStr, testText, flags.global])

  const explanationTokens = useMemo(() => {
    if (!pattern) return []
    try {
       return explainRegex(pattern)
    } catch {
       return []
    }
  }, [pattern])

  const replacedText = useMemo(() => {
    if (!regex || !pattern) return testText
    try {
      const parsedReplacement = replacement.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
      return testText.replace(regex, parsedReplacement)
    } catch {
      return testText
    }
  }, [regex, pattern, testText, replacement])

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Regex Playground</h1>
        <p className="text-xs text-muted-foreground">Test regular expressions with live highlighting, capture groups and a few handy presets.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Your pattern</Label>
          {error && <Badge variant="destructive">{error}</Badge>}
          {!error && regex && (
            <Badge variant="secondary">
              {matches.length === 0 ? 'No matches yet' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border overflow-hidden">
          <span className="px-3 text-muted-foreground font-mono text-lg select-none">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="border-0 focus-visible:ring-0 font-mono text-sm rounded-none flex-1"
            placeholder="Type a regular expression here — e.g. \\d{4}-\\d{2}-\\d{2}"
            spellCheck={false}
          />
          <span className="px-3 text-muted-foreground font-mono text-lg select-none">/{flagStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {([['global', 'Global (g)'], ['ignoreCase', 'Ignore Case (i)'], ['multiline', 'Multiline (m)']] as const).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <Switch
              checked={flags[key]}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, [key]: v }))}
              id={`flag-${key}`}
            />
            <label htmlFor={`flag-${key}`} className="text-sm cursor-pointer">{label}</label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground self-center">Quick presets:</span>
        {PRESETS.map((p) => (
          <Button key={p.label} variant="outline" size="sm" className="text-xs h-7" onClick={() => setPattern(p.pattern)} title={`Use the preset for ${p.label}`}>
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label>Sample text to search</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setTestText(SAMPLE_TEXT)} title="Restore the demo paragraph">Reset to sample</Button>
          </div>
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Paste the text you want to test the pattern against…"
            className="min-h-[200px] font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
        <Tabs defaultValue="matches" className="flex flex-col gap-1 min-w-0">
          <TabsList className="h-8 w-fit self-start">
            <TabsTrigger value="matches" className="text-xs px-3">Matches in context</TabsTrigger>
            <TabsTrigger value="replace" className="text-xs px-3">Replace</TabsTrigger>
            <TabsTrigger value="explanation" className="text-xs px-3">Plain English</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="mt-0">
            <div className="min-h-[200px] h-[200px] rounded-md border border-border bg-muted/20 p-3 font-mono text-sm whitespace-pre-wrap overflow-auto">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                highlightMatches(testText, matches)
              )}
            </div>
          </TabsContent>
          <TabsContent value="replace" className="mt-0 flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="Replacement (e.g. $1 or \n)"
                className="font-mono text-xs h-8"
              />
              <CopyButton text={replacedText} size="sm" />
            </div>
            <div className="min-h-[160px] h-[160px] rounded-md border border-border bg-muted/20 p-3 font-mono text-sm whitespace-pre-wrap overflow-auto">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                replacedText
              )}
            </div>
          </TabsContent>
          <TabsContent value="explanation" className="mt-0">
            <div className="min-h-[200px] h-[200px] rounded-md border border-border bg-muted/20 overflow-auto">
              {explanationTokens.length === 0 ? (
                 <div className="p-4 text-sm text-muted-foreground">Type a pattern to see its explanation.</div>
              ) : (
                explanationTokens.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/30">
                     <div className="font-mono text-sm font-semibold text-primary break-all min-w-[30px] shrink-0 bg-primary/10 rounded px-1.5 text-center">{t.text}</div>
                     <div className="text-sm text-muted-foreground">{t.description}</div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {matches.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>Match details — {matches.length} found</Label>
            <CopyButton text={matches.map((m) => m.match).join('\n')} size="sm" />
          </div>
          <div className="rounded-md border border-border overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Matched text</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Position</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Named groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/20">
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono font-semibold">{m.match}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{m.index}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{Object.keys(m.groups).length > 0 ? JSON.stringify(m.groups) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

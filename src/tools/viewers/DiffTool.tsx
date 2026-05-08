import { useState } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LEFT_SAMPLE = `{
  "name": "ToolGarage",
  "version": "1.0",
  "tools": ["JSON Studio", "AES Cipher"],
  "author": "team"
}`

const RIGHT_SAMPLE = `{
  "name": "ToolGarage",
  "version": "1.1",
  "tools": ["JSON Studio", "AES Cipher", "RSA Toolbox"],
  "author": "developer-team",
  "year": 2026
}`

export default function DiffTool() {
  const [left, setLeft] = useState(LEFT_SAMPLE)
  const [right, setRight] = useState(RIGHT_SAMPLE)
  const [splitView, setSplitView] = useState(true)
  const [method, setMethod] = useState<DiffMethod>(DiffMethod.WORDS)
  const { resolvedTheme } = useTheme()

  const prettifyJson = (text: string, setter: (v: string) => void) => {
    try {
      setter(JSON.stringify(JSON.parse(text), null, 2))
    } catch { /* not json, leave as is */ }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Text &amp; JSON Diff</h1>
          <p className="text-xs text-muted-foreground">Compare two snippets side-by-side or inline, with character / word / line precision.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setLeft(LEFT_SAMPLE); setRight(RIGHT_SAMPLE) }} title="Load sample documents in both panes">Load sample</Button>
          <Select value={method} onValueChange={(v) => setMethod(v as DiffMethod)}>
            <SelectTrigger className="h-8 w-32" title="How fine-grained the diff should be">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DiffMethod.CHARS}>By character</SelectItem>
              <SelectItem value={DiffMethod.WORDS}>By word</SelectItem>
              <SelectItem value={DiffMethod.LINES}>By line</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSplitView((v) => !v)}
            title={splitView ? 'Switch to unified diff view' : 'Switch to side-by-side view'}
          >
            {splitView ? 'Unified view' : 'Split view'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Original (before)</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => prettifyJson(left, setLeft)} title="Pretty-print this side if it's JSON">
              Prettify JSON
            </Button>
          </div>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste the original text or JSON here…"
            className="min-h-[200px] w-full rounded-md border border-border bg-transparent p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modified (after)</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => prettifyJson(right, setRight)} title="Pretty-print this side if it's JSON">
              Prettify JSON
            </Button>
          </div>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste the new version here…"
            className="min-h-[200px] w-full rounded-md border border-border bg-transparent p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
        </div>
      </div>

      <div className="rounded-md border border-border overflow-auto text-sm">
        <ReactDiffViewer
          oldValue={left}
          newValue={right}
          splitView={splitView}
          compareMethod={method}
          useDarkTheme={resolvedTheme === 'dark'}
          hideLineNumbers={false}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: 'transparent',
                addedBackground: '#1a2f1a',
                removedBackground: '#2f1a1a',
              },
              light: {
                diffViewerBackground: 'transparent',
              },
            },
          }}
        />
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { CodeEditor } from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

const SAMPLE = `flowchart TD
    A[User Request] --> B{Auth Check}
    B -- Authenticated --> C[Load Data]
    B -- Unauthenticated --> D[Login Page]
    C --> E[Render Response]
    D --> F[OAuth Flow]
    F --> B`

let mermaidInitialized = false

export default function MermaidTool() {
  const [input, setInput] = useState(SAMPLE)
  const [error, setError] = useState('')
  const [svg, setSvg] = useState('')
  const { resolvedTheme } = useTheme()
  const idRef = useRef(`mermaid-${Date.now()}`)

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      })
      mermaidInitialized = true
    }
  }, [resolvedTheme])

  useEffect(() => {
    const render = async () => {
      if (!input.trim()) { setSvg(''); return }
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        })
        const { svg: rendered } = await mermaid.render(idRef.current, input)
        setSvg(rendered)
        setError('')
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Couldn't render this diagram — check Mermaid syntax.")
        setSvg('')
      }
    }
    const timer = setTimeout(render, 300)
    return () => clearTimeout(timer)
  }, [input, resolvedTheme])

  const downloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Mermaid Diagrams</h1>
          <p className="text-xs text-muted-foreground">Author Mermaid syntax and watch flowcharts, sequences and gantts render live.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <Badge variant="destructive">Render error</Badge>}
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)} title="Load a sample flowchart">Load sample</Button>
          <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg} className="gap-1.5" title="Download the rendered diagram">
            <Download className="h-3.5 w-3.5" /> Download SVG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mermaid source</span>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            <CodeEditor value={input} onChange={setInput} language="markdown" height="100%" />
          </div>
        </div>
        <div className="flex flex-col gap-1 min-h-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live preview</span>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-auto bg-background p-4 flex items-center justify-center">
            {error ? (
              <p className="text-destructive text-sm font-mono whitespace-pre-wrap">{error}</p>
            ) : svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />
            ) : (
              <p className="text-muted-foreground text-sm">Start typing Mermaid syntax to see your diagram come to life…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

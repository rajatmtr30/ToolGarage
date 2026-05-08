import { useState, useEffect } from 'react'
import { jsonrepair } from 'jsonrepair'
import { CodeEditor } from '@/components/CodeEditor'
import { IOPanel } from '@/components/IOPanel'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const SAMPLE = `{"name":"ToolGarage","version":"1.0","tools":["JSON Studio","Mermaid Diagrams","AES Cipher"],"meta":{"author":"developer-team","year":2026}}`

export default function JsonTool() {
  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState('2')
  const [error, setError] = useState('')
  const [repaired, setRepaired] = useState(false)

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      setRepaired(false)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent)))
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "That doesn't look like valid JSON.")
      setOutput('')
    }
  }, [input, indent])

  const handleRepair = () => {
    try {
      const rep = jsonrepair(input)
      setInput(rep)
      setRepaired(true)
    } catch {
      setError("Couldn't auto-repair this — please fix the highlighted error manually.")
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
    } catch {
      setError('Cannot minify until the JSON is valid.')
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">JSON Studio</h1>
          <p className="text-xs text-muted-foreground">Pretty-print, validate, minify and auto-repair JSON — all in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <Badge variant="destructive">Syntax error</Badge>}
          {repaired && <Badge variant="secondary">Auto-repaired</Badge>}
        </div>
      </div>

      <IOPanel
        inputLabel="Your JSON"
        outputLabel="Formatted result"
        inputContent={
          <CodeEditor value={input} onChange={setInput} language="json" height="400px" />
        }
        outputContent={
          <CodeEditor
            value={error ? `// ${error}` : output}
            language="json"
            readOnly
            height="400px"
          />
        }
        outputText={output}
        onClear={() => { setInput(''); setError(''); setRepaired(false) }}
        onSwap={() => { if (output) setInput(output) }}
        toolbar={
          <>
            <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)} title="Load a sample payload">Load sample</Button>
            <Button variant="outline" size="sm" onClick={handleRepair} title="Try to fix common JSON mistakes (trailing commas, single quotes, …)">Auto-repair</Button>
            <Button variant="outline" size="sm" onClick={handleMinify} title="Strip all whitespace">Minify</Button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Indent:</span>
              <Select value={indent} onValueChange={(v) => setIndent(v)}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="tab">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />
    </div>
  )
}

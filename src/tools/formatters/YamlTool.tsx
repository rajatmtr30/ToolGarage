import { useState, useEffect } from 'react'
import yaml from 'js-yaml'
import { CodeEditor } from '@/components/CodeEditor'
import { IOPanel } from '@/components/IOPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SAMPLE = `name: ToolGarage
version: "1.0"
tools:
  - JSON Studio
  - Mermaid Diagrams
  - AES Cipher
meta:
  author: developer-team
  year: 2026
  tags:
    - developer
    - toolkit
    - offline`

export default function YamlTool() {
  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState('2')
  const [error, setError] = useState('')

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }
    try {
      const parsed = yaml.load(input)
      setOutput(yaml.dump(parsed, {
        indent: Number(indent),
        lineWidth: 120,
        noRefs: true,
      }))
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "That doesn't look like valid YAML.")
      setOutput('')
    }
  }, [input, indent])

  const toJson = () => {
    try {
      const parsed = yaml.load(input)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return ''
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">YAML Studio</h1>
          <p className="text-xs text-muted-foreground">Tidy up YAML files and catch syntax errors before they bite.</p>
        </div>
        {error && <Badge variant="destructive">Syntax error</Badge>}
      </div>

      <IOPanel
        inputLabel="Your YAML"
        outputLabel="Formatted result"
        inputContent={
          <CodeEditor value={input} onChange={setInput} language="yaml" height="400px" />
        }
        outputContent={
          <CodeEditor
            value={error ? `# ${error}` : output}
            language="yaml"
            readOnly
            height="400px"
          />
        }
        outputText={output}
        onClear={() => { setInput(''); setError('') }}
        onSwap={() => { if (output) setInput(output) }}
        toolbar={
          <>
            <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)} title="Load a sample document">Load sample</Button>
            <Button variant="outline" size="sm" onClick={() => { const j = toJson(); if (j) setInput(j) }} title="Convert this YAML into JSON">
              Convert to JSON
            </Button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Indent:</span>
              <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />
    </div>
  )
}

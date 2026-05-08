import { useState, useEffect } from 'react'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { CodeEditor } from '@/components/CodeEditor'
import { IOPanel } from '@/components/IOPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><root><name>ToolGarage</name><tools><tool>JSON Studio</tool><tool>Mermaid Diagrams</tool><tool>AES Cipher</tool></tools><meta><author>developer-team</author><year>2026</year></meta></root>`

function formatXml(xml: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: true,
  })
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    preserveOrder: true,
    format: true,
    indentBy: '  ',
    suppressEmptyNode: false,
  })
  const parsed = parser.parse(xml)
  return builder.build(parsed)
}

export default function XmlTool() {
  const [input, setInput] = useState(SAMPLE)
  const [error, setError] = useState('')

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }
    try {
      setOutput(formatXml(input))
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "That doesn't look like valid XML.")
      setOutput('')
    }
  }, [input])

  const handleMinify = () => {
    setInput(input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim())
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">XML Studio</h1>
          <p className="text-xs text-muted-foreground">Format and sanity-check XML documents with proper indentation.</p>
        </div>
        {error && <Badge variant="destructive">Syntax error</Badge>}
      </div>

      <IOPanel
        inputLabel="Your XML"
        outputLabel="Formatted result"
        inputContent={
          <CodeEditor value={input} onChange={setInput} language="xml" height="400px" />
        }
        outputContent={
          <CodeEditor
            value={error ? `<!-- ${error} -->` : output}
            language="xml"
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
            <Button variant="outline" size="sm" onClick={handleMinify} title="Collapse to a single line">Minify</Button>
          </>
        }
      />
    </div>
  )
}

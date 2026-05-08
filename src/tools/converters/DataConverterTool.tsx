import { useState } from 'react'
import yaml from 'js-yaml'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { CodeEditor } from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyButton } from '@/components/CopyButton'
import { ArrowRight } from 'lucide-react'

type Format = 'json' | 'yaml' | 'xml'

const LANGUAGE_MAP: Record<Format, string> = {
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
}

const SAMPLES: Record<Format, string> = {
  json: `{
  "name": "ToolGarage",
  "version": "1.0",
  "tools": ["JSON", "YAML", "XML"],
  "meta": {
    "author": "developer-team",
    "year": 2026
  }
}`,
  yaml: `name: ToolGarage
version: "1.0"
tools:
  - JSON
  - YAML
  - XML
meta:
  author: developer-team
  year: 2026`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>ToolGarage</name>
  <version>1.0</version>
  <tools>
    <item>JSON</item>
    <item>YAML</item>
    <item>XML</item>
  </tools>
  <meta>
    <author>developer-team</author>
    <year>2026</year>
  </meta>
</root>`,
}

function parseInput(input: string, format: Format): unknown {
  switch (format) {
    case 'json': return JSON.parse(input)
    case 'yaml': return yaml.load(input)
    case 'xml': {
      const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true, trimValues: true })
      return parser.parse(input)
    }
  }
}

function serializeOutput(data: unknown, format: Format): string {
  switch (format) {
    case 'json': return JSON.stringify(data, null, 2)
    case 'yaml': return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true })
    case 'xml': {
      const builder = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: '  ', suppressEmptyNode: false })
      return builder.build(data)
    }
  }
}

export default function DataConverterTool() {
  const [inputFormat, setInputFormat] = useState<Format>('json')
  const [outputFormat, setOutputFormat] = useState<Format>('yaml')
  const [input, setInput] = useState(SAMPLES.json)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    setError('')
    setOutput('')
    if (!input.trim()) return
    try {
      const parsed = parseInput(input, inputFormat)
      setOutput(serializeOutput(parsed, outputFormat))
    } catch (e) {
      setError(
        e instanceof Error
          ? `Conversion failed: ${e.message}. Make sure the input really is valid ${inputFormat.toUpperCase()}.`
          : `Conversion failed — please double-check that the input is valid ${inputFormat.toUpperCase()}.`
      )
    }
  }

  const swapFormats = () => {
    setInputFormat(outputFormat)
    setOutputFormat(inputFormat)
    if (output) setInput(output)
    setOutput('')
    setError('')
  }

  const setInputFormatAndSample = (f: Format) => {
    setInputFormat(f)
    setInput(SAMPLES[f])
    setOutput('')
    setError('')
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold">JSON ⇄ YAML ⇄ XML</h1>
        <p className="text-xs text-muted-foreground">Convert configuration and payloads between JSON, YAML and XML in a single click.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From</span>
          <Select value={inputFormat} onValueChange={(v) => setInputFormatAndSample(v as Format)}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={swapFormats} className="gap-1.5" title="Swap input and output formats">
          <ArrowRight className="h-3.5 w-3.5" /> Swap direction
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To</span>
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as Format)}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={convert}>Convert now</Button>
        {error && <Badge variant="destructive">Conversion failed</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your {inputFormat.toUpperCase()}</span>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            <CodeEditor value={input} onChange={setInput} language={LANGUAGE_MAP[inputFormat]} height="400px" />
          </div>
        </div>
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">As {outputFormat.toUpperCase()}</span>
            {output && <CopyButton text={output} size="sm" />}
          </div>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            <CodeEditor
              value={error ? `// ${error}` : output}
              language={LANGUAGE_MAP[outputFormat]}
              readOnly
              height="400px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

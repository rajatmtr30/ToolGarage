import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { jsonrepair } from 'jsonrepair'
import Ajv from 'ajv'
import { CodeEditor } from '@/components/CodeEditor'
import { IOPanel } from '@/components/IOPanel'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function JsonTreeNode({ name, value, isLast, level = 0 }: { name: string | null; value: unknown; isLast: boolean; level?: number }) {
  const [expanded, setExpanded] = useState(true)
  const pad = { paddingLeft: level === 0 && !name ? 0 : 16 }

  if (value === null) return <div className="font-mono text-xs leading-relaxed" style={pad}>{name ? <span className="text-blue-500 dark:text-blue-400">"{name}"</span> : null}{name ? <span className="text-muted-foreground">: </span> : null}<span className="text-muted-foreground font-semibold">null</span>{!isLast && <span className="text-muted-foreground">,</span>}</div>
  if (typeof value === 'boolean') return <div className="font-mono text-xs leading-relaxed" style={pad}>{name ? <span className="text-blue-500 dark:text-blue-400">"{name}"</span> : null}{name ? <span className="text-muted-foreground">: </span> : null}<span className="text-orange-500 font-semibold">{value ? 'true' : 'false'}</span>{!isLast && <span className="text-muted-foreground">,</span>}</div>
  if (typeof value === 'number') return <div className="font-mono text-xs leading-relaxed" style={pad}>{name ? <span className="text-blue-500 dark:text-blue-400">"{name}"</span> : null}{name ? <span className="text-muted-foreground">: </span> : null}<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{value}</span>{!isLast && <span className="text-muted-foreground">,</span>}</div>
  if (typeof value === 'string') return <div className="font-mono text-xs leading-relaxed" style={pad}>{name ? <span className="text-blue-500 dark:text-blue-400">"{name}"</span> : null}{name ? <span className="text-muted-foreground">: </span> : null}<span className="text-amber-600 dark:text-amber-400">"{value}"</span>{!isLast && <span className="text-muted-foreground">,</span>}</div>

  if (Array.isArray(value)) {
    const isEmpty = value.length === 0
    return (
      <div className="font-mono text-xs leading-relaxed" style={pad}>
        <div className="cursor-pointer hover:bg-muted/30 w-fit rounded pr-1 inline-flex items-center select-none" onClick={() => setExpanded(!expanded)}>
          <span className="text-muted-foreground w-4 text-center shrink-0">{isEmpty ? '' : expanded ? '▼' : '▶'}</span>
          {name ? <><span className="text-blue-500 dark:text-blue-400">"{name}"</span><span className="text-muted-foreground">: </span></> : null}
          <span className="text-muted-foreground font-semibold">{expanded || isEmpty ? '[' : `[ ... ] ${value.length} items`}</span>
        </div>
        {expanded && !isEmpty && (
          <div>
            {value.map((v, i) => <JsonTreeNode key={i} name={null} value={v} isLast={i === value.length - 1} level={level + 1} />)}
            <div style={{ paddingLeft: 16 }} className="text-muted-foreground font-semibold">]{!isLast && ','}</div>
          </div>
        )}
        {expanded && isEmpty && <span className="text-muted-foreground font-semibold">]{!isLast && ','}</span>}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    const isEmpty = entries.length === 0
    return (
      <div className="font-mono text-xs leading-relaxed" style={pad}>
        <div className="cursor-pointer hover:bg-muted/30 w-fit rounded pr-1 inline-flex items-center select-none" onClick={() => setExpanded(!expanded)}>
          <span className="text-muted-foreground w-4 text-center shrink-0">{isEmpty ? '' : expanded ? '▼' : '▶'}</span>
          {name ? <><span className="text-blue-500 dark:text-blue-400">"{name}"</span><span className="text-muted-foreground">: </span></> : null}
          <span className="text-muted-foreground font-semibold">{expanded || isEmpty ? '{' : `{ ... } ${entries.length} keys`}</span>
        </div>
        {expanded && !isEmpty && (
          <div>
            {entries.map(([k, v], i) => <JsonTreeNode key={k} name={k} value={v} isLast={i === entries.length - 1} level={level + 1} />)}
            <div style={{ paddingLeft: 16 }} className="text-muted-foreground font-semibold">{'}'}{!isLast && ','}</div>
          </div>
        )}
        {expanded && isEmpty && <span className="text-muted-foreground font-semibold">{'}'}{!isLast && ','}</span>}
      </div>
    )
  }
  return null
}

function jsonToTs(jsonName: string, jsonObj: any): string {
  if (jsonObj === null || typeof jsonObj !== 'object') return ''
  const interfaces: Record<string, string[]> = {}
  
  function getType(val: any, name: string): string {
    if (val === null) return 'any'
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]'
      const type = getType(val[0], name + 'Item')
      return `${type}[]`
    }
    if (typeof val === 'object') {
      const interfaceName = name.charAt(0).toUpperCase() + name.slice(1)
      if (!interfaces[interfaceName]) {
        interfaces[interfaceName] = []
        for (const [k, v] of Object.entries(val)) {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`
          interfaces[interfaceName].push(`  ${safeKey}: ${getType(v, k)};`)
        }
      }
      return interfaceName
    }
    return typeof val
  }
  
  getType(jsonObj, jsonName)
  
  return Object.entries(interfaces).reverse().map(([name, props]) => {
    return `export interface ${name} {\n${props.join('\n')}\n}`
  }).join('\n\n')
}

const SAMPLE = `{"name":"ToolGarage","version":"1.0","tools":["JSON Studio","Mermaid Diagrams","AES Cipher"],"meta":{"author":"developer-team","year":2026}}`

export default function JsonTool() {
  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState('2')
  const [error, setError] = useState('')
  const [repaired, setRepaired] = useState(false)

  const [output, setOutput] = useState('')
  const [tsOutput, setTsOutput] = useState('')
  const [parsedObj, setParsedObj] = useState<unknown>(null)

  const [schemaInput, setSchemaInput] = useState('{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" }\n  }\n}')
  const [schemaResult, setSchemaResult] = useState<{ valid: boolean; errors: any[] } | null>(null)

  const handleValidateSchema = () => {
    if (!schemaInput.trim() || parsedObj === null) return
    const startTime = performance.now()
    try {
      const ajv = new Ajv({ allErrors: true })
      const schema = JSON.parse(schemaInput)
      const validate = ajv.compile(schema)
      const valid = validate(parsedObj)
      setSchemaResult({ valid, errors: validate.errors || [] })
      
      analytics.formatter('format_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: valid,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
      if (!valid) {
        analytics.error('validation_failed', {
          tool_name: 'JsonTool',
          error_message: 'JSON failed schema validation',
          action: 'validate_schema'
        })
      }
    } catch (e) {
      setSchemaResult({ valid: false, errors: [{ message: `Schema error: ${e instanceof Error ? e.message : 'Invalid JSON schema'}` }] })
      analytics.error('validation_failed', {
        tool_name: 'JsonTool',
        error_message: e instanceof Error ? e.message : 'Invalid JSON schema',
        action: 'validate_schema_compile'
      })
    }
  }

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setTsOutput('')
      setParsedObj(null)
      setError('')
      setRepaired(false)
      return
    }
    const startTime = performance.now()
    try {
      const parsed = JSON.parse(input)
      setParsedObj(parsed)
      setOutput(JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent)))
      setTsOutput(jsonToTs('RootObject', parsed))
      setError('')
      
      analytics.formatter('format_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: true,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "That doesn't look like valid JSON.")
      setOutput('')
      setTsOutput('')
      setParsedObj(null)
      setSchemaResult(null)
      
      analytics.formatter('format_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: false,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
    }
  }, [input, indent])

  const handleRepair = () => {
    const startTime = performance.now()
    try {
      const rep = jsonrepair(input)
      setInput(rep)
      setRepaired(true)
      analytics.formatter('repair_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: true,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
    } catch {
      setError("Couldn't auto-repair this — please fix the highlighted error manually.")
      analytics.formatter('repair_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: false,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
    }
  }

  const handleMinify = () => {
    const startTime = performance.now()
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
      analytics.formatter('minify_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: true,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
    } catch {
      setError('Cannot minify until the JSON is valid.')
      analytics.formatter('minify_json', {
        tool_name: 'JsonTool',
        input_size: input.length,
        success: false,
        execution_time_ms: Math.round(performance.now() - startTime)
      })
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
          <Tabs defaultValue="text" className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-2">
              <TabsList className="h-8 bg-transparent">
                <TabsTrigger value="text" className="text-xs data-[state=active]:bg-muted">Text</TabsTrigger>
                <TabsTrigger value="tree" className="text-xs data-[state=active]:bg-muted">Tree View</TabsTrigger>
                <TabsTrigger value="ts" className="text-xs data-[state=active]:bg-muted">TypeScript</TabsTrigger>
                <TabsTrigger value="schema" className="text-xs data-[state=active]:bg-muted">Schema Validator</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="text" className="mt-0 flex-1 min-h-0">
              <CodeEditor
                value={error ? `// ${error}` : output}
                language="json"
                readOnly
                height="100%"
              />
            </TabsContent>
            <TabsContent value="tree" className="mt-0 flex-1 overflow-auto p-4 bg-[#1e1e1e] rounded-b-md border-t border-border/10">
              {error ? (
                <div className="text-destructive font-mono text-sm">// {error}</div>
              ) : parsedObj !== null ? (
                <JsonTreeNode name={null} value={parsedObj} isLast={true} />
              ) : null}
            </TabsContent>
            <TabsContent value="ts" className="mt-0 flex-1 min-h-0">
              <CodeEditor
                value={error ? `// ${error}` : tsOutput || '// Root must be an object/array'}
                language="typescript"
                readOnly
                height="100%"
              />
            </TabsContent>
            <TabsContent value="schema" className="mt-0 flex-1 min-h-0 flex flex-col gap-2 p-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">JSON Schema Definition</span>
                <Button size="sm" onClick={handleValidateSchema} disabled={!parsedObj}>Validate JSON against Schema</Button>
              </div>
              <div className="h-[200px] border border-border rounded-md overflow-hidden shrink-0">
                <CodeEditor value={schemaInput} onChange={(v) => { setSchemaInput(v); setSchemaResult(null) }} language="json" height="100%" />
              </div>
              {schemaResult && (
                <div className={`flex-1 overflow-auto rounded-md border p-3 ${schemaResult.valid ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
                  {schemaResult.valid ? (
                    <div className="text-green-600 dark:text-green-400 font-medium text-sm">✅ JSON matches schema perfectly!</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="text-destructive font-medium text-sm">❌ Schema validation failed:</div>
                      <ul className="text-xs text-destructive font-mono list-disc pl-5">
                        {schemaResult.errors.map((err, i) => (
                          <li key={i}>{err.instancePath || 'root'} {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        }
        outputText={output}
        onClear={() => { setInput(''); setError(''); setRepaired(false); analytics.ux('clear_input', { tool_name: 'JsonTool' }) }}
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

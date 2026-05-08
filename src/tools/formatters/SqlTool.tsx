import { useState, useEffect } from 'react'
import { format } from 'sql-formatter'
import { CodeEditor } from '@/components/CodeEditor'
import { IOPanel } from '@/components/IOPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const SAMPLE = `SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 AND o.total>100 ORDER BY o.created_at DESC LIMIT 50`

const DIALECTS = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'plsql', label: 'Oracle (PL/SQL)' },
  { value: 'transactsql', label: 'T-SQL (SQL Server)' },
  { value: 'sqlite', label: 'SQLite' },
]

type Dialect = 'sql' | 'mysql' | 'postgresql' | 'plsql' | 'transactsql' | 'sqlite'

/** Best-effort SQL cleanup before re-attempting formatting. */
function repairSql(sql: string): string {
  return sql
    // remove block comments
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    // remove line comments
    .replace(/--[^\n]*/g, ' ')
    // collapse runs of whitespace / newlines into a single space
    .replace(/\s+/g, ' ')
    // strip trailing semicolons so the formatter adds its own
    .replace(/;\s*$/, '')
    .trim()
}

export default function SqlTool() {
  const [input, setInput] = useState(SAMPLE)
  const [dialect, setDialect] = useState<Dialect>('sql')
  const [indent, setIndent] = useState('2')
  const [autoRepair, setAutoRepair] = useState(true)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [repaired, setRepaired] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      setRepaired(false)
      return
    }

    const opts = {
      language: dialect,
      tabWidth: Number(indent),
      keywordCase: 'upper' as const,
      linesBetweenQueries: 1,
    }

    try {
      setOutput(format(input, opts))
      setError('')
      setRepaired(false)
    } catch {
      if (autoRepair) {
        try {
          const cleaned = repairSql(input)
          setOutput(format(cleaned, opts))
          setError('')
          setRepaired(true)
          return
        } catch {
          // fall through to show error
        }
      }
      setRepaired(false)
      setError("Couldn't format this query — check the syntax for the selected dialect.")
      setOutput('')
    }
  }, [input, dialect, indent, autoRepair])

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">SQL Studio</h1>
          <p className="text-xs text-muted-foreground">Pretty-print SQL queries — pick your dialect and indent style.</p>
        </div>
        <div className="flex items-center gap-2">
          {repaired && <Badge variant="secondary" title="Auto-repair cleaned the query before formatting">Auto-repaired</Badge>}
          {error && <Badge variant="destructive">Format error</Badge>}
        </div>
      </div>

      <IOPanel
        inputLabel="Your SQL"
        outputLabel="Formatted query"
        inputContent={
          <CodeEditor value={input} onChange={setInput} language="sql" height="400px" />
        }
        outputContent={
          <CodeEditor
            value={error ? `-- ${error}` : output}
            language="sql"
            readOnly
            height="400px"
          />
        }
        outputText={output}
        onClear={() => { setInput(''); setError(''); setRepaired(false) }}
        onSwap={() => { if (output) setInput(output) }}
        toolbar={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput(SAMPLE)}
              title="Load a sample query"
            >
              Load sample
            </Button>

            <Select value={dialect} onValueChange={(v) => setDialect(v as Dialect)}>
              <SelectTrigger className="h-8 w-40" title="SQL dialect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIALECTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Indent:</span>
              <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="h-8 w-24" title="Indentation width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2" title="Strip comments and collapse whitespace before retrying when formatting fails">
              <Switch
                id="sql-autorepair"
                checked={autoRepair}
                onCheckedChange={setAutoRepair}
                className="h-5 w-9"
              />
              <Label htmlFor="sql-autorepair" className="cursor-pointer text-xs text-muted-foreground select-none">
                Auto-repair
              </Label>
            </div>
          </>
        }
      />
    </div>
  )
}

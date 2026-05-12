import { useState } from 'react'
import { faker } from '@faker-js/faker'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'

function LoremTab() {
  const [mode, setMode] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs')
  const [count, setCount] = useState('3')
  const [output, setOutput] = useState('')

  const generate = () => {
    const n = Math.max(1, parseInt(count) || 3)
    let text = ''
    if (mode === 'words') text = faker.lorem.words(n)
    else if (mode === 'sentences') text = Array.from({ length: n }, () => faker.lorem.sentence()).join(' ')
    else text = Array.from({ length: n }, () => faker.lorem.paragraph()).join('\n\n')
    setOutput(text)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Give me</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="words">Words</SelectItem>
              <SelectItem value="sentences">Sentences</SelectItem>
              <SelectItem value="paragraphs">Paragraphs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>How many?</Label>
          <Input type="number" min="1" max="50" value={count} onChange={(e) => setCount(e.target.value)} className="w-20" />
        </div>
        <Button onClick={generate}>Generate text</Button>
      </div>
      {output && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between"><Label>Generated text</Label><CopyButton text={output} size="sm" /></div>
          <Textarea value={output} readOnly className="min-h-[200px] text-sm resize-none bg-muted/30" />
        </div>
      )}
    </div>
  )
}

const FAKE_DATA_TYPES = [
  { label: 'Full Name', fn: () => faker.person.fullName() },
  { label: 'Email', fn: () => faker.internet.email() },
  { label: 'Phone', fn: () => faker.phone.number() },
  { label: 'Company', fn: () => faker.company.name() },
  { label: 'Job Title', fn: () => faker.person.jobTitle() },
  { label: 'Street Address', fn: () => faker.location.streetAddress() },
  { label: 'City', fn: () => faker.location.city() },
  { label: 'Country', fn: () => faker.location.country() },
  { label: 'ZIP Code', fn: () => faker.location.zipCode() },
  { label: 'Username', fn: () => faker.internet.username() },
  { label: 'Password', fn: () => faker.internet.password({ length: 16 }) },
  { label: 'URL', fn: () => faker.internet.url() },
  { label: 'IPv4', fn: () => faker.internet.ipv4() },
  { label: 'UUID', fn: () => faker.string.uuid() },
  { label: 'Date', fn: () => faker.date.recent({ days: 365 }).toISOString() },
  { label: 'Credit Card', fn: () => faker.finance.creditCardNumber() },
  { label: 'IBAN', fn: () => faker.finance.iban() },
  { label: 'Color (HEX)', fn: () => faker.color.rgb({ format: 'hex' }) },
  { label: 'Product Name', fn: () => faker.commerce.productName() },
  { label: 'Price', fn: () => faker.commerce.price() },
]

function FakeDataTab() {
  const [count, setCount] = useState('5')
  const [selected, setSelected] = useState<string[]>(['Full Name', 'Email', 'Phone', 'Company', 'City'])
  const [rows, setRows] = useState<Record<string, string>[]>([])

  const toggle = (label: string) =>
    setSelected((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])

  const generate = () => {
    const n = Math.max(1, Math.min(50, parseInt(count) || 5))
    const typeMap = Object.fromEntries(FAKE_DATA_TYPES.map((t) => [t.label, t.fn]))
    setRows(Array.from({ length: n }, () =>
      Object.fromEntries(selected.map((label) => [label, typeMap[label]?.() ?? '']))
    ))
  }

  const toJson = () => JSON.stringify(rows, null, 2)
  const toCsv = () => {
    if (!rows.length) return ''
    const headers = selected.join(',')
    const lines = rows.map((r) => selected.map((k) => `"${r[k]}"`).join(','))
    return [headers, ...lines].join('\n')
  }
  const toSql = () => {
    if (!rows.length) return ''
    const table = 'mock_data'
    const headers = selected.map(h => `"${h.replace(/ /g, '_').toLowerCase()}"`).join(', ')
    return rows.map((r) => {
      const values = selected.map((k) => `'${r[k].replace(/'/g, "''")}'`).join(', ')
      return `INSERT INTO ${table} (${headers}) VALUES (${values});`
    }).join('\n')
  }

  const downloadFile = (content: string, filename: string) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    a.download = filename
    a.click()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>Pick the fields you want in each row:</Label>
        <div className="flex flex-wrap gap-2">
          {FAKE_DATA_TYPES.map(({ label }) => (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${selected.includes(label) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              title={selected.includes(label) ? 'Click to remove this field' : 'Click to include this field'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>How many rows?</Label>
          <Input type="number" min="1" max="50" value={count} onChange={(e) => setCount(e.target.value)} className="w-20" />
        </div>
        <Button onClick={generate} disabled={selected.length === 0}>Generate rows</Button>
        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadFile(toJson(), 'mock-data.json')} className="gap-2" title="Download as JSON">
              <Download className="h-3.5 w-3.5" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadFile(toCsv(), 'mock-data.csv')} className="gap-2" title="Download as CSV">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadFile(toSql(), 'mock-data.sql')} className="gap-2" title="Download as SQL">
              <Download className="h-3.5 w-3.5" />
              SQL
            </Button>
          </div>
        )}
      </div>
      {rows.length > 0 && (
        <div className="overflow-auto rounded-md border border-border max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {selected.map((h) => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/20">
                  {selected.map((k) => <td key={k} className="px-3 py-2 text-xs font-mono">{row[k]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function LoremTool() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Mock Data</h1>
        <p className="text-xs text-muted-foreground">Generate Lorem Ipsum copy or realistic seed data — names, emails, addresses, finance and more.</p>
      </div>
      <Tabs defaultValue="lorem">
        <TabsList>
          <TabsTrigger value="lorem">Lorem Ipsum</TabsTrigger>
          <TabsTrigger value="fake">Realistic records</TabsTrigger>
        </TabsList>
        <TabsContent value="lorem" className="mt-3"><LoremTab /></TabsContent>
        <TabsContent value="fake" className="mt-3"><FakeDataTab /></TabsContent>
      </Tabs>
    </div>
  )
}

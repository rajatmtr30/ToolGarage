import { useState, useEffect } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COMMON_STRINGS } from '@/constants/common'
import { URL_TOOL_STRINGS } from '@/constants/UrlTool.constants'
import './UrlTool.css'

function UrlBuilder({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl)
  const [scheme, setScheme] = useState('')
  const [host, setHost] = useState('')
  const [path, setPath] = useState('')
  const [params, setParams] = useState<[string, string][]>([])

  useEffect(() => {
    try {
      const u = new URL(url)
      setScheme(u.protocol.replace(':', ''))
      setHost(u.host)
      setPath(u.pathname)
      setParams(Array.from(u.searchParams.entries()))
    } catch {
      // not a valid URL
    }
  }, [url])

  const updateUrl = (newScheme: string, newHost: string, newPath: string, newParams: [string, string][]) => {
    try {
      const sp = new URLSearchParams()
      newParams.forEach(([k, v]) => { if (k) sp.append(k, v) })
      const spStr = sp.toString()
      const newUrl = `${newScheme ? newScheme + '://' : ''}${newHost}${newPath}${spStr ? '?' + spStr : ''}`
      setUrl(newUrl)
    } catch {}
  }

  const updateScheme = (v: string) => { setScheme(v); updateUrl(v, host, path, params) }
  const updateHost = (v: string) => { setHost(v); updateUrl(scheme, v, path, params) }
  const updatePath = (v: string) => { setPath(v); updateUrl(scheme, host, v, params) }
  const updateParam = (i: number, k: string, v: string) => {
    const newParams = [...params]
    newParams[i] = [k, v]
    setParams(newParams)
    updateUrl(scheme, host, path, newParams)
  }
  const addParam = () => {
    const newParams: [string, string][] = [...params, ['', '']]
    setParams(newParams)
    updateUrl(scheme, host, path, newParams)
  }
  const removeParam = (i: number) => {
    const newParams = params.filter((_, idx) => idx !== i)
    setParams(newParams)
    updateUrl(scheme, host, path, newParams)
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-md border border-border bg-muted/10">
      <div className="flex flex-col gap-1.5">
        <Label>Full URL</Label>
        <div className="flex gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} className="font-mono flex-1 text-sm" placeholder="https://..." />
          <CopyButton text={url} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5"><Label>Scheme</Label><Input value={scheme} onChange={e => updateScheme(e.target.value)} placeholder="https" className="font-mono text-sm" /></div>
        <div className="flex flex-col gap-1.5"><Label>Host</Label><Input value={host} onChange={e => updateHost(e.target.value)} placeholder="example.com" className="font-mono text-sm" /></div>
        <div className="flex flex-col gap-1.5"><Label>Path</Label><Input value={path} onChange={e => updatePath(e.target.value)} placeholder="/api/search" className="font-mono text-sm" /></div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Query Parameters</Label>
        <div className="flex flex-col gap-2">
          {params.length === 0 && <span className="text-xs text-muted-foreground">No query parameters.</span>}
          {params.map(([k, v], i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={k} onChange={e => updateParam(i, e.target.value, v)} placeholder="Key" className="font-mono text-sm w-1/3" />
              <Input value={v} onChange={e => updateParam(i, k, e.target.value)} placeholder="Value" className="font-mono text-sm flex-1" />
              <Button variant="ghost" size="icon" onClick={() => removeParam(i)}>×</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addParam} className="w-fit">+ Add parameter</Button>
        </div>
      </div>
    </div>
  )
}

const SAMPLE_URL = URL_TOOL_STRINGS.SAMPLE_URL

export default function UrlTool() {
  const [input, setInput] = useState(SAMPLE_URL)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [useComponent, setUseComponent] = useState(true)

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) {
      setOutput('')
      setError('')
      return
    }
    try {
      if (mode === 'encode') {
        setOutput(useComponent ? encodeURIComponent(input) : encodeURI(input))
      } else {
        setOutput(useComponent ? decodeURIComponent(input) : decodeURI(input))
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : URL_TOOL_STRINGS.ERROR_INVALID_URL)
      setOutput('')
    }
  }, [input, mode, useComponent])

  const parseQueryParams = (url: string) => {
    try {
      const u = new URL(url.startsWith('http') ? url : `http://x.com/?${url}`)
      const params: [string, string][] = []
      u.searchParams.forEach((v, k) => params.push([k, v]))
      return params
    } catch {
      return []
    }
  }

  const params = parseQueryParams(input)

  return (
    <div className="url-tool-container">
      <div>
        <h1 className="url-tool-header">{URL_TOOL_STRINGS.TITLE}</h1>
        <p className="url-tool-description">{URL_TOOL_STRINGS.DESCRIPTION}</p>
      </div>

      <Tabs defaultValue="encode" className="mt-4">
        <TabsList>
          <TabsTrigger value="encode">Encode / Decode</TabsTrigger>
          <TabsTrigger value="builder">URL Builder & Parser</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-4 flex flex-col gap-4">
          <div className="url-tool-actions">
            <Button variant={mode === 'encode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('encode')} title={URL_TOOL_STRINGS.ENCODE_TITLE}>{URL_TOOL_STRINGS.ENCODE}</Button>
            <Button variant={mode === 'decode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('decode')} title={URL_TOOL_STRINGS.DECODE_TITLE}>{URL_TOOL_STRINGS.DECODE}</Button>
            <Button
              variant={useComponent ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setUseComponent((v) => !v)}
              title={URL_TOOL_STRINGS.MODE_TITLE}
            >
              {useComponent ? URL_TOOL_STRINGS.MODE_COMPONENT : URL_TOOL_STRINGS.MODE_FULL}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE_URL)} title={URL_TOOL_STRINGS.LOAD_SAMPLE_TITLE}>{URL_TOOL_STRINGS.LOAD_SAMPLE}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setInput(''); setError('') }}>{COMMON_STRINGS.CLEAR}</Button>
          </div>

          <div className="url-tool-grid">
            <div className="url-tool-col">
              <span className="url-tool-label">{COMMON_STRINGS.YOUR_INPUT}</span>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={URL_TOOL_STRINGS.PLACEHOLDER_INPUT}
                className="url-tool-textarea"
              />
            </div>
            <div className="url-tool-col">
              <div className="url-tool-result-header">
                <span className="url-tool-label">{COMMON_STRINGS.RESULT}</span>
                <div className="url-tool-result-actions">
                  {error && <Badge variant="destructive">{URL_TOOL_STRINGS.DECODE_FAILED}</Badge>}
                  <Button variant="ghost" size="sm" className="url-tool-roundtrip-btn" onClick={() => setInput(output)} title={COMMON_STRINGS.ROUND_TRIP_TITLE}>{COMMON_STRINGS.ROUND_TRIP}</Button>
                  <CopyButton text={output} size="sm" />
                </div>
              </div>
              <Textarea
                value={error || output}
                readOnly
                className="url-tool-textarea-readonly"
              />
            </div>
          </div>

          {params.length > 0 && (
            <div className="url-tool-col">
              <span className="url-tool-label">{URL_TOOL_STRINGS.QUERY_PARAMS_DETECTED}</span>
              <div className="url-tool-table-container">
                <table className="url-tool-table">
                  <thead className="url-tool-table-head">
                    <tr>
                      <th className="url-tool-th">{URL_TOOL_STRINGS.PARAMETER}</th>
                      <th className="url-tool-th">{URL_TOOL_STRINGS.VALUE}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map(([k, v], i) => (
                      <tr key={i} className="url-tool-tr">
                        <td className="url-tool-td-key">{k}</td>
                        <td className="url-tool-td-val">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="builder" className="mt-4">
           <UrlBuilder initialUrl={input || SAMPLE_URL} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

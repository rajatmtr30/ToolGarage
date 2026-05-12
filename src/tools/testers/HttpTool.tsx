import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/CopyButton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, AlertTriangle, Info, History } from 'lucide-react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

interface Header { key: string; value: string; enabled: boolean }
interface EnvVar { key: string; value: string; enabled: boolean }

interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  duration: number
  size: number
}

function StatusBadge({ status }: { status: number }) {
  const color = status < 200 ? 'outline' : status < 300 ? 'default' : status < 400 ? 'secondary' : 'destructive'
  return <Badge variant={color as 'default' | 'destructive' | 'outline' | 'secondary'}>{status}</Badge>
}

function prettyJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

function QueryParamsTab({ url, setUrl }: { url: string, setUrl: (u: string) => void }) {
  let params: [string, string][] = []
  let baseUrl = url
  try {
    const u = new URL(url)
    params = Array.from(u.searchParams.entries())
    u.search = ''
    baseUrl = u.toString()
  } catch {
    if (url.includes('?')) {
      const [base, ...queryParts] = url.split('?')
      baseUrl = base
      params = Array.from(new URLSearchParams(queryParts.join('?')).entries())
    }
  }

  const updateParam = (i: number, key: string, value: string) => {
    const newParams = [...params]
    newParams[i] = [key, value]
    const sp = new URLSearchParams()
    newParams.forEach(([k, v]) => sp.append(k, v))
    const spStr = sp.toString()
    setUrl(baseUrl + (spStr ? '?' + spStr : ''))
  }

  const addParam = () => {
    const newParams = [...params, ['', '']]
    const sp = new URLSearchParams()
    newParams.forEach(([k, v]) => sp.append(k, v))
    setUrl(baseUrl + '?' + sp.toString())
  }

  const removeParam = (i: number) => {
    const newParams = params.filter((_, idx) => idx !== i)
    const sp = new URLSearchParams()
    newParams.forEach(([k, v]) => sp.append(k, v))
    const spStr = sp.toString()
    setUrl(baseUrl + (spStr ? '?' + spStr : ''))
  }

  return (
    <div className="flex flex-col gap-2">
      {params.length === 0 && <p className="text-xs text-muted-foreground p-2">No query parameters in URL.</p>}
      {params.map(([k, v], i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={k} onChange={e => updateParam(i, e.target.value, v)} placeholder="Query Parameter (e.g. page)" className="font-mono text-xs w-1/3" />
          <Input value={v} onChange={e => updateParam(i, k, e.target.value)} placeholder="Value (e.g. 2)" className="font-mono text-xs flex-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeParam(i)} title="Remove parameter">×</Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addParam} className="w-fit">+ Add parameter</Button>
    </div>
  )
}

export default function HttpTool() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Accept', value: 'application/json', enabled: true },
    { key: 'Content-Type', value: 'application/json', enabled: true },
  ])
  const [body, setBody] = useState('')
  const [bodyType, setBodyType] = useState<'raw' | 'graphql'>('raw')
  const [gqlQuery, setGqlQuery] = useState('')
  const [gqlVars, setGqlVars] = useState('{}')
  const [auth, setAuth] = useState<{ type: 'none' | 'bearer' | 'basic', bearerToken: string, basicUser: string, basicPass: string }>({ type: 'none', bearerToken: '', basicUser: '', basicPass: '' })
  const [response, setResponse] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<{ id: string, method: string, url: string, date: number }[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true }])

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('http_history') || '[]')) } catch { }
    try {
      const savedEnv = localStorage.getItem('http_envVars')
      if (savedEnv) setEnvVars(JSON.parse(savedEnv))
    } catch { }
  }, [])

  const saveEnvVars = (newVars: EnvVar[]) => {
    setEnvVars(newVars)
    localStorage.setItem('http_envVars', JSON.stringify(newVars))
  }

  const interpolate = (str: string) => {
    let result = str
    envVars.filter(v => v.enabled && v.key.trim()).forEach(v => {
      result = result.split(`{{${v.key}}}`).join(v.value)
    })
    return result
  }

  const addHeader = () => setHeaders((h) => [...h, { key: '', value: '', enabled: true }])
  const updateHeader = (i: number, field: keyof Header, value: string | boolean) =>
    setHeaders((h) => h.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  const removeHeader = (i: number) => setHeaders((h) => h.filter((_, idx) => idx !== i))

  const send = async () => {
    setError('')
    setResponse(null)
    if (!url.trim()) return
    setLoading(true)
    const start = Date.now()
    try {
      const finalUrl = interpolate(url)
      const headersObj: Record<string, string> = {}
      headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => { headersObj[interpolate(h.key)] = interpolate(h.value) })

      if (auth.type === 'bearer' && auth.bearerToken) {
        headersObj['Authorization'] = `Bearer ${interpolate(auth.bearerToken)}`
      } else if (auth.type === 'basic' && (auth.basicUser || auth.basicPass)) {
        headersObj['Authorization'] = `Basic ${btoa(interpolate(auth.basicUser) + ':' + interpolate(auth.basicPass))}`
      }

      let payload = body
      if (bodyType === 'graphql') {
        headersObj['Content-Type'] = 'application/json'
        try {
          payload = JSON.stringify({ query: gqlQuery, variables: JSON.parse(gqlVars || '{}') })
        } catch {
          throw new Error("Invalid GraphQL Variables JSON")
        }
      }

      const init: RequestInit = { method, headers: headersObj }
      if (!['GET', 'HEAD'].includes(method) && payload.trim()) init.body = interpolate(payload)

      const res = await fetch(finalUrl, init)
      const text = await res.text()
      const duration = Date.now() - start
      const respHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { respHeaders[k] = v })

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: respHeaders,
        body: text,
        duration,
        size: new TextEncoder().encode(text).length,
      })

      const newHistory = [{ id: Date.now().toString(), method, url, date: Date.now() }, ...history.filter(h => h.url !== url || h.method !== method)].slice(0, 30)
      setHistory(newHistory)
      localStorage.setItem('http_history', JSON.stringify(newHistory))
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — if this is an external API, the server probably isn't returning CORS headers. Try the cURL tab to run it from your terminal instead.`
          : "Request couldn't complete. Check your URL, network connection, or CORS policy on the target server."
      )
    } finally {
      setLoading(false)
    }
  }

  const generateCurl = () => {
    const finalUrl = interpolate(url)
    const headersObj: Record<string, string> = {}
    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => { headersObj[interpolate(h.key)] = interpolate(h.value) })
    if (auth.type === 'bearer' && auth.bearerToken) { headersObj['Authorization'] = `Bearer ${interpolate(auth.bearerToken)}` }
    else if (auth.type === 'basic' && (auth.basicUser || auth.basicPass)) { headersObj['Authorization'] = `Basic ${btoa(interpolate(auth.basicUser) + ':' + interpolate(auth.basicPass))}` }

    let payload = body
    if (bodyType === 'graphql') {
      headersObj['Content-Type'] = 'application/json'
      try { payload = JSON.stringify({ query: gqlQuery, variables: JSON.parse(gqlVars || '{}') }) } catch { }
    }

    const headerFlags = Object.entries(headersObj).map(([k, v]) => `-H "${k}: ${v}"`).join(' ')
    const bodyStr = interpolate(payload)
    const bodyFlag = !['GET', 'HEAD'].includes(method) && bodyStr.trim() ? `-d '${bodyStr.replace(/'/g, "\\'")}'` : ''
    return `curl -X ${method} ${headerFlags} ${bodyFlag} "${finalUrl}"`.replace(/\s+/g, ' ').trim()
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">HTTP Sandbox</h1>
        <p className="text-xs text-muted-foreground">Fire off any HTTP request, inspect the response, and copy a ready-to-run cURL command — Postman-lite, in your browser.</p>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          <strong>Heads up — CORS:</strong> the browser will block calls to any server that doesn't return CORS headers.
          Internal APIs usually just work. For public APIs, either enable CORS on the server, or use the cURL tab to run the same request from your terminal.
        </span>
      </div>

      <div className="flex gap-2">
        <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
          <SelectTrigger className="w-28 font-mono font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as HttpMethod[]).map((m) => (
              <SelectItem key={m} value={m} className="font-mono">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint  (press Enter to send)"
          className="font-mono flex-1"
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <Button onClick={send} disabled={loading || !url.trim()} className="gap-2 min-w-20">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : 'Send request'}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Request History"><History className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request History</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
              {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 cursor-pointer rounded-md border border-border/50" onClick={() => { setMethod(h.method as any); setUrl(h.url) }}>
                  <Badge variant="outline" className="w-16 justify-center shrink-0">{h.method}</Badge>
                  <span className="text-sm font-mono truncate flex-1">{h.url}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(h.date).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="headers" onValueChange={(v) => {
        if (v === 'body') setBodyType('raw')
        if (v === 'graphql') setBodyType('graphql')
      }}>
        <TabsList>
          <TabsTrigger value="params">Query Params</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="headers">Request headers ({headers.filter((h) => h.enabled).length})</TabsTrigger>
          {!['GET', 'HEAD'].includes(method) && <TabsTrigger value="body">Request body</TabsTrigger>}
          {['POST'].includes(method) && <TabsTrigger value="graphql">GraphQL</TabsTrigger>}
          <TabsTrigger value="env">Variables ({envVars.filter((v) => v.enabled).length})</TabsTrigger>
          <TabsTrigger value="curl">As cURL</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="mt-3">
          <QueryParamsTab url={url} setUrl={setUrl} />
        </TabsContent>

        <TabsContent value="auth" className="mt-3 flex flex-col gap-4 max-w-lg">
          <Select value={auth.type} onValueChange={(v: any) => setAuth({ ...auth, type: v })}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Auth</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
              <SelectItem value="basic">Basic Auth</SelectItem>
            </SelectContent>
          </Select>
          {auth.type === 'bearer' && (
            <div className="flex flex-col gap-1.5">
              <Label>Token</Label>
              <Input value={auth.bearerToken} onChange={(e) => setAuth({ ...auth, bearerToken: e.target.value })} placeholder="eyJhbGciOiJIUzI1NiIs..." className="font-mono text-sm" />
            </div>
          )}
          {auth.type === 'basic' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><Label>Username</Label><Input value={auth.basicUser} onChange={(e) => setAuth({ ...auth, basicUser: e.target.value })} /></div>
              <div className="flex flex-col gap-1.5"><Label>Password</Label><Input type="password" value={auth.basicPass} onChange={(e) => setAuth({ ...auth, basicPass: e.target.value })} /></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="headers" className="mt-3 flex flex-col gap-2">
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="checkbox" checked={h.enabled} onChange={(e) => updateHeader(i, 'enabled', e.target.checked)} className="shrink-0" title="Toggle this header on/off" />
              <Input value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} placeholder="Header name (e.g. Authorization)" className="font-mono text-xs" />
              <Input value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} placeholder="Value (e.g. Bearer token…)" className="font-mono text-xs flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeHeader(i)} title="Remove this header">×</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addHeader} className="w-fit">+ Add another header</Button>
        </TabsContent>

        {!['GET', 'HEAD'].includes(method) && (
          <TabsContent value="body" className="mt-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={'Request body — JSON, form data, raw text, anything you like.\n\ne.g. { "name": "ToolGarage", "url": "{{baseUrl}}" }'}
              className="min-h-[160px] font-mono text-sm resize-none"
              spellCheck={false}
            />
          </TabsContent>
        )}

        {['POST'].includes(method) && (
          <TabsContent value="graphql" className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Query</Label>
              <Textarea
                value={gqlQuery}
                onChange={(e) => setGqlQuery(e.target.value)}
                placeholder={'query {\n  users {\n    id\n    name\n  }\n}'}
                className="min-h-[160px] font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Variables (JSON)</Label>
              <Textarea
                value={gqlVars}
                onChange={(e) => setGqlVars(e.target.value)}
                placeholder={'{\n  "id": 1\n}'}
                className="min-h-[160px] font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>
          </TabsContent>
        )}

        <TabsContent value="env" className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Define variables and use them anywhere as {"{{variable_name}}"}.
          </div>
          {envVars.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="checkbox" checked={v.enabled} onChange={(e) => saveEnvVars(envVars.map((row, idx) => idx === i ? { ...row, enabled: e.target.checked } : row))} className="shrink-0" title="Toggle this variable on/off" />
              <Input value={v.key} onChange={(e) => saveEnvVars(envVars.map((row, idx) => idx === i ? { ...row, key: e.target.value } : row))} placeholder="Variable name (e.g. baseUrl)" className="font-mono text-xs w-1/3" />
              <Input value={v.value} onChange={(e) => saveEnvVars(envVars.map((row, idx) => idx === i ? { ...row, value: e.target.value } : row))} placeholder="Value (e.g. https://api.example.com)" className="font-mono text-xs flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => saveEnvVars(envVars.filter((_, idx) => idx !== i))} title="Remove this variable">×</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => saveEnvVars([...envVars, { key: '', value: '', enabled: true }])} className="w-fit">+ Add another variable</Button>
        </TabsContent>

        <TabsContent value="curl" className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Same request, expressed as a cURL command — handy for sharing or running in your terminal.
            </div>
            <CopyButton text={generateCurl()} size="sm" />
          </div>
          <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs font-mono whitespace-pre-wrap break-all">{generateCurl()}</pre>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Request failed.</strong> {error}
            {error.toLowerCase().includes('cors') || error.toLowerCase().includes('network') ? (
              <p className="mt-1 text-xs">Looks like a CORS or network issue. Hop over to the <em>As cURL</em> tab and run that command in your terminal — it bypasses browser CORS.</p>
            ) : null}
          </div>
        </div>
      )}

      {response && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <StatusBadge status={response.status} />
            <span className="text-muted-foreground">{response.statusText}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{response.duration} ms</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{(response.size / 1024).toFixed(1)} KB returned</span>
          </div>

          <Tabs defaultValue="body">
            <TabsList>
              <TabsTrigger value="body">Response body</TabsTrigger>
              <TabsTrigger value="headers">Response headers ({Object.keys(response.headers).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="body" className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Content-Type: {response.headers['content-type'] ?? 'unknown'}</span>
                <CopyButton text={response.body} size="sm" />
              </div>
              <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-3 text-xs font-mono whitespace-pre-wrap break-all">
                {prettyJson(response.body)}
              </pre>
            </TabsContent>
            <TabsContent value="headers" className="mt-2">
              <div className="rounded-md border border-border overflow-hidden">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/20 text-xs">
                    <span className="font-mono font-semibold text-primary w-48 shrink-0">{k}</span>
                    <span className="font-mono flex-1">{v}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

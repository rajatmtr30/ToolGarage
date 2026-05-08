import { useState } from 'react'
import { decodeJwt, decodeProtectedHeader } from 'jose'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

function JsonBlock({ label, data }: { label: string; data: object }) {
  const text = JSON.stringify(data, null, 2)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <CopyButton text={text} size="sm" />
      </div>
      <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  )
}

function ExpiryBadge({ exp }: { exp?: number }) {
  if (!exp) return null
  const now = Math.floor(Date.now() / 1000)
  const expired = exp < now
  const date = new Date(exp * 1000).toLocaleString()
  return (
    <div className={`flex items-center gap-1.5 text-xs ${expired ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
      <Clock className="h-3.5 w-3.5" />
      {expired ? `This token expired on ${date}` : `Valid until ${date}`}
    </div>
  )
}

export default function JwtTool() {
  const [token, setToken] = useState(SAMPLE_JWT)
  const [error, setError] = useState('')

  let header: Record<string, unknown> | null = null
  let payload: Record<string, unknown> | null = null

  if (token.trim()) {
    try {
      header = decodeProtectedHeader(token.trim()) as Record<string, unknown>
      payload = decodeJwt(token.trim()) as Record<string, unknown>
      if (error) setError('')
    } catch (e) {
      if (!error) setError(e instanceof Error ? e.message : "That doesn't look like a valid JWT — expected three dot-separated Base64URL parts.")
    }
  }

  const parts = token.trim().split('.')
  const isValidStructure = parts.length === 3

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">JWT Inspector</h1>
        <p className="text-xs text-muted-foreground">Decode any JSON Web Token, peek at claims, and check expiry — no signing key required.</p>
      </div>
      <PrivacyBanner />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paste your token</span>
          <div className="flex gap-2 items-center">
            {isValidStructure && !error && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Looks like a well-formed JWT
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5" /> {error}
              </span>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setToken(SAMPLE_JWT)} title="Try with a demo token">Load sample</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setToken('')}>Clear</Button>
          </div>
        </div>
        <Textarea
          value={token}
          onChange={(e) => { setToken(e.target.value); setError('') }}
          placeholder="eyJhbGciOiJIUzI1NiIs…   — paste your JWT here, with or without the &quot;Bearer &quot; prefix"
          className="min-h-[80px] font-mono text-sm resize-none"
        />
      </div>

      {isValidStructure && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Token segments (header.payload.signature)</span>
          <div className="font-mono text-xs break-all leading-relaxed">
            <span className="text-red-500">{parts[0]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-violet-500">{parts[1]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-cyan-500">{parts[2]}</span>
          </div>
        </div>
      )}

      {payload && (
        <ExpiryBadge exp={typeof payload.exp === 'number' ? payload.exp : undefined} />
      )}

      <div className="grid grid-cols-2 gap-3">
        {header && <JsonBlock label="Header" data={header} />}
        {payload && <JsonBlock label="Payload" data={payload} />}
      </div>

      {!header && !error && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Paste a JWT above and we'll break it apart into header and payload.
        </div>
      )}
    </div>
  )
}

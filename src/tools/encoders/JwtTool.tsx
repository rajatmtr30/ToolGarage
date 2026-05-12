import { useState, useEffect } from 'react'
import { decodeJwt, decodeProtectedHeader, jwtVerify, importSPKI, importX509 } from 'jose'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react'

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
  const [secret, setSecret] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState('')

  let header: Record<string, any> | null = null
  let payload: Record<string, any> | null = null

  if (token.trim()) {
    try {
      header = decodeProtectedHeader(token.trim()) as Record<string, any>
      payload = decodeJwt(token.trim()) as Record<string, any>
      if (error) setError('')
    } catch (e) {
      if (!error) setError(e instanceof Error ? e.message : "That doesn't look like a valid JWT — expected three dot-separated Base64URL parts.")
    }
  }

  const parts = token.trim().split('.')
  const isValidStructure = parts.length === 3

  useEffect(() => {
    async function verify() {
      if (!token.trim() || !secret.trim() || !isValidStructure || error) {
        setVerifyResult(null)
        setVerifyError('')
        return
      }
      try {
        const hdr = decodeProtectedHeader(token.trim())
        const alg = hdr.alg
        if (!alg || alg === 'none') {
          setVerifyResult(false)
          setVerifyError('Unsecured JWT (alg: none) cannot be verified.')
          return
        }

        let key
        if (alg.startsWith('HS')) {
          key = new TextEncoder().encode(secret)
        } else if (alg.startsWith('RS') || alg.startsWith('PS') || alg.startsWith('ES')) {
          try {
             if (secret.includes('BEGIN CERTIFICATE')) {
               key = await importX509(secret, alg)
             } else {
               key = await importSPKI(secret, alg)
             }
          } catch (e) {
            setVerifyResult(false)
            setVerifyError('Failed to parse public key/certificate PEM format.')
            return
          }
        } else {
           setVerifyResult(false)
           setVerifyError(`Unsupported algorithm for verification: ${alg}`)
           return
        }

        await jwtVerify(token.trim(), key)
        setVerifyResult(true)
        setVerifyError('')
      } catch (e) {
        setVerifyResult(false)
        setVerifyError(e instanceof Error ? e.message : 'Signature verification failed.')
      }
    }
    verify()
  }, [token, secret, isValidStructure, error])

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

      {isValidStructure && !error && (
        <div className="flex flex-col gap-3 p-4 rounded-md border border-border bg-muted/20 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signature Verification</span>
            {header?.alg && <Badge variant="outline">{header.alg}</Badge>}
          </div>
          <Textarea
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={header?.alg?.startsWith('HS') ? "Enter secret (HMAC key)..." : "Enter public key or certificate (PEM format)..."}
            className="min-h-[80px] font-mono text-sm resize-none"
            spellCheck={false}
          />
          {verifyResult !== null && secret.trim() && (
            <div className={`flex items-center gap-2 text-sm font-medium ${verifyResult ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {verifyResult ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              {verifyResult ? 'Signature Verified' : `Invalid Signature: ${verifyError}`}
            </div>
          )}
        </div>
      )}

      {!header && !error && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Paste a JWT above and we'll break it apart into header and payload.
        </div>
      )}
    </div>
  )
}

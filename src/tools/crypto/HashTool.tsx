import { useState } from 'react'
import { computeAllHashes, bcryptHash, bcryptVerify, hmac } from '@/lib/hash'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { FileDrop } from '@/components/FileDrop'
import CryptoJS from 'crypto-js'
import type { HashResult, HashAlgorithm } from '@/lib/hash'

function HashesTab() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<HashResult[]>([])

  const run = async () => {
    if (!input) { setHashes([]); return }
    const results = await computeAllHashes(input)
    setHashes(results)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Text to hash</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value) }}
            placeholder="Type or paste anything — a password, a payload, a file's contents…"
            className="font-mono"
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
          <Button onClick={run} disabled={!input}>Compute all hashes</Button>
          <Button variant="outline" onClick={() => { setInput(''); setHashes([]) }}>Clear</Button>
        </div>
        <p className="text-xs text-muted-foreground">Tip: press <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">Enter</kbd> to run all algorithms in one shot.</p>
      </div>

      {hashes.length > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-border overflow-hidden">
          {hashes.map((h) => (
            <div key={h.algorithm} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{h.algorithm}</span>
              <span className="font-mono text-xs flex-1 truncate">{h.hex}</span>
              <CopyButton text={h.hex} size="icon" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FileHashTab() {
  const [hashes, setHashes] = useState<HashResult[]>([])
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleFile = async (content: string | ArrayBuffer, name: string) => {
    setFileName(name)
    setLoading(true)
    setHashes([])
    
    try {
      const results: HashResult[] = []
      const buffer = content as ArrayBuffer
      setFileSize(buffer.byteLength)
      
      const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
      const toBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)))
      
      // MD5 using CryptoJS
      const wordArr = CryptoJS.lib.WordArray.create(buffer as any)
      const md5 = CryptoJS.MD5(wordArr)
      results.push({ algorithm: 'MD5', hex: md5.toString(CryptoJS.enc.Hex), base64: md5.toString(CryptoJS.enc.Base64) })
      
      // Web Crypto algorithms
      const algs: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
      for (const alg of algs) {
        const digest = await crypto.subtle.digest(alg, buffer)
        results.push({ algorithm: alg, hex: toHex(digest), base64: toBase64(digest) })
      }
      
      setHashes(results)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FileDrop
        onFile={handleFile}
        readAs="arrayBuffer"
        label="Drop a file here (or click to select) to compute its hashes"
      />
      
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Hashing {fileName}…</div>}

      {hashes.length > 0 && !loading && (
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="font-semibold text-foreground">{fileName}</span>
            <span className="text-muted-foreground">{(fileSize / 1024).toFixed(1)} KB</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border overflow-hidden">
            {hashes.map((h) => (
              <div key={h.algorithm} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{h.algorithm}</span>
                <span className="font-mono text-xs flex-1 truncate">{h.hex}</span>
                <CopyButton text={h.hex} size="icon" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BcryptTab() {
  const [input, setInput] = useState('')
  const [rounds, setRounds] = useState('10')
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifying, setVerifying] = useState(false)

  const handleHash = async () => {
    setLoading(true)
    try {
      setHash(await bcryptHash(input, parseInt(rounds)))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      setVerifyResult(await bcryptVerify(verifyInput, verifyHash.trim()))
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 rounded-md border border-border bg-muted/20">
        <h3 className="text-sm font-medium">Hash a password</h3>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label>Password (or any text)</Label>
            <Input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type the password to hash…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label title="Higher = slower & stronger. 10 is a sensible default; 12+ for high-value secrets.">Cost (rounds)</Label>
            <Select value={rounds} onValueChange={setRounds}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[8, 10, 12, 14].map((r) => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleHash} disabled={!input || loading} className="w-fit gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Hashing…' : 'Generate bcrypt hash'}
        </Button>
        {hash && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between"><Label>Your bcrypt hash — safe to store in a database</Label><CopyButton text={hash} size="sm" /></div>
            <Input value={hash} readOnly className="font-mono text-xs bg-muted/30" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-md border border-border bg-muted/20">
        <h3 className="text-sm font-medium">Check a password against a hash</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5"><Label>Password to check</Label>
            <Input type="password" value={verifyInput} onChange={(e) => setVerifyInput(e.target.value)} placeholder="The password the user typed in…" />
          </div>
          <div className="flex flex-col gap-1.5"><Label>Stored bcrypt hash</Label>
            <Input value={verifyHash} onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null) }} placeholder="$2b$10$… (the hash from your DB)" className="font-mono text-xs" />
          </div>
        </div>
        <Button onClick={handleVerify} disabled={!verifyInput || !verifyHash || verifying} className="w-fit gap-2">
          {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
          {verifying ? 'Comparing…' : 'Verify match'}
        </Button>
        {verifyResult !== null && (
          <div className={`flex items-center gap-2 text-sm font-medium ${verifyResult ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {verifyResult ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {verifyResult ? 'Match — this password produced that hash.' : 'No match — this password did NOT produce that hash.'}
          </div>
        )}
      </div>
    </div>
  )
}

function HmacTab() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [algo, setAlgo] = useState<'MD5' | 'SHA-256' | 'SHA-512'>('SHA-256')
  const [result, setResult] = useState('')

  const run = () => {
    if (!input || !key) return
    setResult(hmac(input, key, algo))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><Label>Message to authenticate</Label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[80px] font-mono text-sm resize-none" placeholder="The exact payload you'd put on the wire…" />
        </div>
        <div className="flex flex-col gap-1.5"><Label>Shared secret key</Label>
          <Textarea value={key} onChange={(e) => setKey(e.target.value)} className="min-h-[80px] font-mono text-sm resize-none" placeholder="The key both sides have agreed on…" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Select value={algo} onValueChange={(v) => setAlgo(v as typeof algo)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="MD5">HMAC-MD5 (legacy)</SelectItem>
            <SelectItem value="SHA-256">HMAC-SHA256 (recommended)</SelectItem>
            <SelectItem value="SHA-512">HMAC-SHA512 (stronger)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={run} disabled={!input || !key}>Compute HMAC</Button>
      </div>
      {result && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between"><Label>HMAC digest (hex)</Label><CopyButton text={result} size="sm" /></div>
          <Input value={result} readOnly className="font-mono text-xs bg-muted/30" />
        </div>
      )}
    </div>
  )
}

export default function HashTool() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Hash Lab</h1>
        <p className="text-xs text-muted-foreground">Compute MD5, SHA-1/2/3, RIPEMD-160, bcrypt and HMAC — all entirely in your browser.</p>
      </div>
      <PrivacyBanner />
      <Tabs defaultValue="hashes">
        <TabsList>
          <TabsTrigger value="hashes">Text Hashes</TabsTrigger>
          <TabsTrigger value="file">File Hashes</TabsTrigger>
          <TabsTrigger value="bcrypt">bcrypt</TabsTrigger>
          <TabsTrigger value="hmac">HMAC</TabsTrigger>
        </TabsList>
        <TabsContent value="hashes" className="mt-3"><HashesTab /></TabsContent>
        <TabsContent value="file" className="mt-3"><FileHashTab /></TabsContent>
        <TabsContent value="bcrypt" className="mt-3"><BcryptTab /></TabsContent>
        <TabsContent value="hmac" className="mt-3"><HmacTab /></TabsContent>
      </Tabs>
    </div>
  )
}

import { useState } from 'react'
import { jasyptEncrypt, jasyptDecrypt, type JasyptAlgorithm } from '@/lib/jasypt'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Info } from 'lucide-react'

const ALGORITHMS: { value: JasyptAlgorithm; label: string; description: string }[] = [
  {
    value: 'PBEWithMD5AndDES',
    label: 'PBEWithMD5AndDES — legacy',
    description: "Jasypt's original default (pre Spring Boot 2). Uses DES + MD5-based key derivation. Pick this only when decrypting old values.",
  },
  {
    value: 'PBEWITHHMACSHA512ANDAES_256',
    label: 'PBEWITHHMACSHA512ANDAES_256 — recommended',
    description: 'The modern default for Spring Boot 2+. Uses AES-256 with PBKDF2 / HMAC-SHA512. Use this for new properties.',
  },
]

export default function JasyptTool() {
  const [algorithm, setAlgorithm] = useState<JasyptAlgorithm>('PBEWITHHMACSHA512ANDAES_256')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [iterations, setIterations] = useState('1000')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt')

  const algoInfo = ALGORITHMS.find((a) => a.value === algorithm)

  const run = async () => {
    setError('')
    setOutput('')
    if (!input.trim() || !password) {
      setError('Please fill in both the input text and the encryption password before running.')
      return
    }
    setLoading(true)
    try {
      const iters = Math.max(1, parseInt(iterations) || 1000)
      if (operation === 'encrypt') {
        setOutput(await jasyptEncrypt(input, password, algorithm, iters))
      } else {
        setOutput(await jasyptDecrypt(input.trim(), password, algorithm, iters))
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} failed: ${e.message}. Make sure the password, algorithm and iteration count match what your Spring app uses.`
          : "Operation failed — verify the password, algorithm and iteration count match your Spring Boot config."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Jasypt for Spring</h1>
        <p className="text-xs text-muted-foreground">
          Drop-in compatible with <code className="bg-muted px-1 rounded text-[11px]">jasypt-spring-boot</code> — encrypt new property values or decrypt existing <code className="bg-muted px-1 rounded text-[11px]">ENC(…)</code> ones.
        </p>
      </div>
      <PrivacyBanner />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Algorithm</Label>
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as JasyptAlgorithm)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map((a) => (
                <SelectItem key={a.value} value={a.value} className="text-xs">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label title="Match jasypt.encryptor.key-obtention-iterations in application.properties">Key obtention iterations</Label>
          <Input
            type="number"
            min="1"
            max="100000"
            value={iterations}
            onChange={(e) => setIterations(e.target.value)}
            className="font-mono"
            placeholder="1000"
          />
        </div>
      </div>

      {algoInfo && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {algoInfo.description}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label title="This must match jasypt.encryptor.password in your Spring app">Encryption password</Label>
        <div className="flex gap-1.5">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="The same password your Spring app uses (jasypt.encryptor.password)…"
            className="font-mono"
          />
          <Button variant="outline" size="icon" onClick={() => setShowPassword((v) => !v)} title={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={operation === 'encrypt' ? 'default' : 'outline'} size="sm" onClick={() => { setOperation('encrypt'); setOutput(''); setError(''); }} title="Encrypt a plain value into Jasypt ciphertext">Encrypt</Button>
        <Button variant={operation === 'decrypt' ? 'default' : 'outline'} size="sm" onClick={() => { setOperation('decrypt'); setOutput(''); setError(''); }} title="Reveal the plain value behind ENC(…)">Decrypt</Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{operation === 'encrypt' ? 'Plain value to encrypt' : 'Jasypt ciphertext to decrypt'}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            operation === 'encrypt'
              ? 'e.g. mySecretDatabasePassword'
              : 'Paste the value from your config — works with or without the surrounding ENC(…)'
          }
          className="min-h-[80px] font-mono text-sm resize-none"
        />
      </div>

      <Button onClick={run} disabled={loading || !input.trim()} className="w-fit">
        {loading ? 'Working…' : operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </Button>

      {(output || error) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>{operation === 'encrypt' ? 'Encrypted value — paste this into your config wrapped in ENC(…)' : 'Decrypted plain value'}</Label>
            <div className="flex gap-1.5 items-center">
              {error && <Badge variant="destructive">Failed</Badge>}
              {output && operation === 'encrypt' && <CopyButton text={`ENC(${output})`} size="sm" />}
              {output && operation === 'decrypt' && <CopyButton text={output} size="sm" />}
            </div>
          </div>
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm font-mono">{error}</div>
          ) : (
            <div className="flex flex-col gap-1">
              <Textarea value={output} readOnly className="min-h-[60px] font-mono text-sm resize-none bg-muted/30 break-all" />
              {operation === 'encrypt' && (
                <p className="text-xs text-muted-foreground">
                  Use it like: <code className="bg-muted px-1 rounded">my.property=ENC({output.substring(0, 16)}…)</code>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

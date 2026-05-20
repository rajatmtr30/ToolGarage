import { useState } from 'react'
import { aesEncrypt, aesDecrypt, generateRandomHex, deriveKeyPBKDF2, type AesMode, type KeySize } from '@/lib/aes'
import { analytics } from '@/lib/analytics'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'

const MODE_IV_BYTES: Record<AesMode, number> = { CBC: 16, GCM: 12, CTR: 16 }
const KEY_BYTES: Record<KeySize, number> = { 128: 16, 192: 24, 256: 32 }

export default function AesTool() {
  const [mode, setMode] = useState<AesMode>('CBC')
  const [keySize, setKeySize] = useState<KeySize>(256)
  const [key, setKey] = useState(generateRandomHex(32))
  const [iv, setIv] = useState(generateRandomHex(16))
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt')

  const [keyType, setKeyType] = useState<'raw' | 'pbkdf2'>('raw')
  const [passphrase, setPassphrase] = useState('')
  const [salt, setSalt] = useState(generateRandomHex(16))
  const [iterations, setIterations] = useState('100000')

  const handleGenKey = () => setKey(generateRandomHex(KEY_BYTES[keySize]))
  const handleGenIv = () => setIv(generateRandomHex(MODE_IV_BYTES[mode]))

  const run = async () => {
    setError('')
    setOutput('')
    if (!input.trim()) return
    setLoading(true)
    const startTime = performance.now()
    try {
      let finalKey = key
      if (keyType === 'pbkdf2') {
        if (!passphrase) throw new Error("Passphrase is required for PBKDF2 key derivation.")
        finalKey = await deriveKeyPBKDF2(passphrase, salt, parseInt(iterations) || 100000, keySize)
        setKey(finalKey)
      }

      if (operation === 'encrypt') {
        setOutput(await aesEncrypt(input, finalKey, iv, mode))
        analytics.crypto('encrypt_action', {
          algorithm: `AES_${mode}`,
          mode: mode,
          key_size: keySize,
          success: true,
          execution_time_ms: Math.round(performance.now() - startTime)
        })
      } else {
        setOutput(await aesDecrypt(input.trim(), finalKey, iv, mode))
        analytics.crypto('decrypt_action', {
          algorithm: `AES_${mode}`,
          mode: mode,
          key_size: keySize,
          success: true,
          execution_time_ms: Math.round(performance.now() - startTime)
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error
          ? `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} failed: ${e.message}`
          : `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} failed — double-check the key, IV and mode all match.`
      setError(errMsg)
      
      analytics.crypto(operation === 'encrypt' ? 'encrypt_action' : 'decrypt_action', {
        algorithm: `AES_${mode}`,
        mode: mode,
        key_size: keySize,
        success: false,
        execution_time_ms: Math.round(performance.now() - startTime)
      })

      analytics.error('tool_exception', {
        tool_name: 'AesTool',
        error_message: e instanceof Error ? e.message : 'Unknown error',
        action: operation
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">AES Cipher</h1>
        <p className="text-xs text-muted-foreground">Encrypt or decrypt with AES — choose your mode (CBC, GCM, CTR) and 128/192/256-bit keys.</p>
      </div>
      <PrivacyBanner />

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => { setMode(v as AesMode); setIv(generateRandomHex(MODE_IV_BYTES[v as AesMode])) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CBC">AES-CBC</SelectItem>
              <SelectItem value="GCM">AES-GCM</SelectItem>
              <SelectItem value="CTR">AES-CTR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Key Size</Label>
          <Select value={String(keySize)} onValueChange={(v) => { setKeySize(Number(v) as KeySize); setKey(generateRandomHex(KEY_BYTES[Number(v) as KeySize])) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="128">128-bit</SelectItem>
              <SelectItem value="192">192-bit</SelectItem>
              <SelectItem value="256">256-bit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Operation</Label>
          <Select value={operation} onValueChange={(v) => { setOperation(v as 'encrypt' | 'decrypt'); setOutput(''); setError(''); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="encrypt">Encrypt</SelectItem>
              <SelectItem value="decrypt">Decrypt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-md border border-border bg-muted/10">
        <Tabs value={keyType} onValueChange={(v) => setKeyType(v as 'raw' | 'pbkdf2')}>
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="raw">Raw Hex Key</TabsTrigger>
            <TabsTrigger value="pbkdf2">PBKDF2 Passphrase</TabsTrigger>
          </TabsList>
          
          <TabsContent value="raw" className="mt-4 flex flex-col gap-1.5">
            <Label>Secret key (hex — needs {keySize / 4} hex characters)</Label>
            <div className="flex gap-1.5">
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono text-xs"
                placeholder={`${keySize / 4} hex characters…`}
              />
              <Button variant="outline" size="icon" onClick={handleGenKey} title="Generate a fresh random key">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <CopyButton text={key} size="icon" />
            </div>
          </TabsContent>
          
          <TabsContent value="pbkdf2" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Passphrase</Label>
              <Input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Type a strong password..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Salt (hex)</Label>
                <div className="flex gap-1.5">
                  <Input value={salt} onChange={(e) => setSalt(e.target.value)} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => setSalt(generateRandomHex(16))}><RefreshCw className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Iterations</Label>
                <Input value={iterations} onChange={(e) => setIterations(e.target.value)} type="number" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-1.5 p-4 rounded-md border border-border bg-muted/10">
        <Label>IV / nonce (hex — needs {MODE_IV_BYTES[mode] * 2} hex characters)</Label>
        <div className="flex gap-1.5">
          <Input
            value={iv}
            onChange={(e) => setIv(e.target.value)}
            className="font-mono text-xs"
            placeholder={`${MODE_IV_BYTES[mode] * 2} hex characters…`}
          />
          <Button variant="outline" size="icon" onClick={handleGenIv} title="Generate a fresh random IV / nonce">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <CopyButton text={iv} size="icon" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{operation === 'encrypt' ? 'Plaintext to encrypt' : 'Base64 ciphertext to decrypt'}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={operation === 'encrypt' ? 'Type or paste the text you want to encrypt…' : 'Paste the Base64 ciphertext you previously generated…'}
          className="min-h-[100px] font-mono text-sm resize-none"
        />
      </div>

      <Button onClick={run} disabled={loading || !input.trim()} className="w-fit">
        {loading ? 'Working…' : operation === 'encrypt' ? `Encrypt with AES-${keySize}-${mode}` : `Decrypt with AES-${keySize}-${mode}`}
      </Button>

      {(output || error) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>{operation === 'encrypt' ? 'Ciphertext (Base64)' : 'Decrypted plaintext'}</Label>
            <div className="flex gap-1.5 items-center">
              {error && <Badge variant="destructive">Failed</Badge>}
              {output && <CopyButton text={output} size="sm" />}
            </div>
          </div>
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm font-mono">{error}</div>
          ) : (
            <Textarea value={output} readOnly className="min-h-[80px] font-mono text-sm resize-none bg-muted/30 break-all" />
          )}
        </div>
      )}
    </div>
  )
}

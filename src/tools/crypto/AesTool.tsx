import { useState } from 'react'
import { aesEncrypt, aesDecrypt, generateRandomHex, type AesMode, type KeySize } from '@/lib/aes'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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

  const handleGenKey = () => setKey(generateRandomHex(KEY_BYTES[keySize]))
  const handleGenIv = () => setIv(generateRandomHex(MODE_IV_BYTES[mode]))

  const run = async () => {
    setError('')
    setOutput('')
    if (!input.trim()) return
    setLoading(true)
    try {
      if (operation === 'encrypt') {
        setOutput(await aesEncrypt(input, key, iv, mode))
      } else {
        setOutput(await aesDecrypt(input.trim(), key, iv, mode))
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} failed: ${e.message}`
          : `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} failed — double-check the key, IV and mode all match.`
      )
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
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
        </div>
        <div className="flex flex-col gap-1.5">
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

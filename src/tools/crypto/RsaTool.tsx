import { useState } from 'react'
import { generateRsaKeyPair, rsaEncrypt, rsaDecrypt, rsaSign, rsaVerify, type RsaKeySize, type RsaPadding } from '@/lib/rsa'
import { analytics } from '@/lib/analytics'
import { PrivacyBanner } from '@/components/PrivacyBanner'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

function KeyPairSection({
  publicKey, privateKey, onGenerate, generating,
  keySize, setKeySize,
}: {
  publicKey: string
  privateKey: string
  onGenerate: () => void
  generating: boolean
  keySize: RsaKeySize
  setKeySize: (v: RsaKeySize) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v) as RsaKeySize)}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1024">1024-bit</SelectItem>
            <SelectItem value="2048">2048-bit</SelectItem>
            <SelectItem value="4096">4096-bit</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onGenerate} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {generating ? 'Generating…' : 'Generate new key pair'}
        </Button>
        {generating && <span className="text-xs text-muted-foreground">Hang on — 4096-bit keys can take a few seconds.</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label title="Safe to share. Anyone with this can encrypt to you or verify your signatures.">Public key (PEM) — share freely</Label>
            <CopyButton text={publicKey} size="sm" />
          </div>
          <Textarea value={publicKey} readOnly className="min-h-[160px] font-mono text-xs resize-none bg-muted/30" placeholder="Click 'Generate new key pair' to populate." />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label title="Keep this secret. Never commit this to git or send it over chat.">Private key (PEM) — keep secret</Label>
            <CopyButton text={privateKey} size="sm" />
          </div>
          <Textarea value={privateKey} readOnly className="min-h-[160px] font-mono text-xs resize-none bg-muted/30" placeholder="Click 'Generate new key pair' to populate." />
        </div>
      </div>
    </div>
  )
}

export default function RsaTool() {
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [keySize, setKeySize] = useState<RsaKeySize>(2048)
  const [padding, setPadding] = useState<RsaPadding>('OAEP')
  const [generating, setGenerating] = useState(false)

  const [encInput, setEncInput] = useState('')
  const [encPubKey, setEncPubKey] = useState('')
  const [encOutput, setEncOutput] = useState('')
  const [encError, setEncError] = useState('')

  const [decInput, setDecInput] = useState('')
  const [decPrivKey, setDecPrivKey] = useState('')
  const [decOutput, setDecOutput] = useState('')
  const [decError, setDecError] = useState('')

  const [signInput, setSignInput] = useState('')
  const [signPrivKey, setSignPrivKey] = useState('')
  const [signature, setSignature] = useState('')
  const [signError, setSignError] = useState('')

  const [verifyMsg, setVerifyMsg] = useState('')
  const [verifySig, setVerifySig] = useState('')
  const [verifyPubKey, setVerifyPubKey] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState('')

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const pair = await generateRsaKeyPair(keySize)
      setPublicKey(pair.publicKey)
      setPrivateKey(pair.privateKey)
      setEncPubKey(pair.publicKey)
      setDecPrivKey(pair.privateKey)
      setSignPrivKey(pair.privateKey)
      setVerifyPubKey(pair.publicKey)
      analytics.crypto('rsa_key_generate', { algorithm: 'RSA', key_size: keySize, success: true })
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">RSA Toolbox</h1>
        <p className="text-xs text-muted-foreground">Generate key pairs, encrypt/decrypt with PKCS#1 or OAEP, and sign or verify messages — all asymmetric crypto in one place.</p>
      </div>
      <PrivacyBanner />

      <div className="flex items-center gap-3">
        <Label title="OAEP is the modern, recommended padding. PKCS#1 v1.5 is for compatibility with older systems.">Padding scheme</Label>
        <Select value={padding} onValueChange={(v) => setPadding(v as RsaPadding)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="OAEP">OAEP — SHA-256 (recommended)</SelectItem>
            <SelectItem value="PKCS1">PKCS#1 v1.5 (legacy)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="keygen">
        <TabsList>
          <TabsTrigger value="keygen">Key generation</TabsTrigger>
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
          <TabsTrigger value="sign">Sign</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
        </TabsList>

        <TabsContent value="keygen" className="mt-3">
          <KeyPairSection
            publicKey={publicKey} privateKey={privateKey}
            onGenerate={handleGenerate} generating={generating}
            keySize={keySize} setKeySize={setKeySize}
          />
        </TabsContent>

        <TabsContent value="encrypt" className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1"><Label>Recipient's public key (PEM)</Label>
            <Textarea value={encPubKey} onChange={(e) => setEncPubKey(e.target.value)} className="min-h-[100px] font-mono text-xs resize-none" placeholder="-----BEGIN PUBLIC KEY----- … paste here" />
          </div>
          <div className="flex flex-col gap-1"><Label>Message to encrypt</Label>
            <Textarea value={encInput} onChange={(e) => setEncInput(e.target.value)} className="min-h-[80px] font-mono text-sm resize-none" placeholder="Type or paste the text you want to send securely…" />
          </div>
          <Button className="w-fit" onClick={() => { setEncError(''); try { setEncOutput(rsaEncrypt(encInput, encPubKey, padding)); analytics.crypto('encrypt_action', { algorithm: 'RSA', mode: padding, success: true }) } catch (e) { setEncError(e instanceof Error ? `Encryption failed: ${e.message}` : 'Encryption failed — check the public key format.') } }} disabled={!encInput || !encPubKey}>Encrypt with RSA-{padding}</Button>
          {(encOutput || encError) && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between"><Label>Ciphertext (Base64) — share this</Label>{encOutput && <CopyButton text={encOutput} size="sm" />}</div>
              {encError ? <div className="text-destructive text-sm font-mono">{encError}</div> : <Textarea value={encOutput} readOnly className="min-h-[60px] font-mono text-xs resize-none bg-muted/30 break-all" />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decrypt" className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1"><Label>Your private key (PEM)</Label>
            <Textarea value={decPrivKey} onChange={(e) => setDecPrivKey(e.target.value)} className="min-h-[100px] font-mono text-xs resize-none" placeholder="-----BEGIN PRIVATE KEY----- … paste here (never share this)" />
          </div>
          <div className="flex flex-col gap-1"><Label>Ciphertext (Base64)</Label>
            <Textarea value={decInput} onChange={(e) => setDecInput(e.target.value)} className="min-h-[60px] font-mono text-xs resize-none" placeholder="Paste the Base64 ciphertext you received…" />
          </div>
          <Button className="w-fit" onClick={() => { setDecError(''); try { setDecOutput(rsaDecrypt(decInput.trim(), decPrivKey, padding)); analytics.crypto('decrypt_action', { algorithm: 'RSA', mode: padding, success: true }) } catch (e) { setDecError(e instanceof Error ? `Decryption failed: ${e.message}. Make sure the padding (${padding}) and key match the ones used to encrypt.` : 'Decryption failed — check the key and padding mode match.') } }} disabled={!decInput || !decPrivKey}>Decrypt with RSA-{padding}</Button>
          {(decOutput || decError) && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between"><Label>Recovered message</Label>{decOutput && <CopyButton text={decOutput} size="sm" />}</div>
              {decError ? <div className="text-destructive text-sm font-mono">{decError}</div> : <Textarea value={decOutput} readOnly className="min-h-[60px] font-mono text-sm resize-none bg-muted/30" />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sign" className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1"><Label>Your private key (PEM) — used to prove authorship</Label>
            <Textarea value={signPrivKey} onChange={(e) => setSignPrivKey(e.target.value)} className="min-h-[100px] font-mono text-xs resize-none" placeholder="-----BEGIN PRIVATE KEY----- … paste here" />
          </div>
          <div className="flex flex-col gap-1"><Label>Message to sign</Label>
            <Textarea value={signInput} onChange={(e) => setSignInput(e.target.value)} className="min-h-[80px] font-mono text-sm resize-none" placeholder="The exact message you want to sign — even one extra space changes the signature." />
          </div>
          <Button className="w-fit" onClick={() => { setSignError(''); try { setSignature(rsaSign(signInput, signPrivKey)); analytics.crypto('hash_generate', { algorithm: 'RSA_SIGN', success: true }) } catch (e) { setSignError(e instanceof Error ? `Signing failed: ${e.message}` : 'Signing failed — check the private key format.') } }} disabled={!signInput || !signPrivKey}>Sign with SHA-256</Button>
          {(signature || signError) && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between"><Label>Signature (Base64) — send alongside the message</Label>{signature && <CopyButton text={signature} size="sm" />}</div>
              {signError ? <div className="text-destructive text-sm font-mono">{signError}</div> : <Textarea value={signature} readOnly className="min-h-[60px] font-mono text-xs resize-none bg-muted/30 break-all" />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verify" className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1"><Label>Sender's public key (PEM)</Label>
            <Textarea value={verifyPubKey} onChange={(e) => setVerifyPubKey(e.target.value)} className="min-h-[100px] font-mono text-xs resize-none" placeholder="-----BEGIN PUBLIC KEY----- … paste here" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1"><Label>Original message</Label>
              <Textarea value={verifyMsg} onChange={(e) => setVerifyMsg(e.target.value)} className="min-h-[80px] font-mono text-sm resize-none" placeholder="The exact message that was signed…" />
            </div>
            <div className="flex flex-col gap-1"><Label>Signature to verify (Base64)</Label>
              <Textarea value={verifySig} onChange={(e) => setVerifySig(e.target.value)} className="min-h-[80px] font-mono text-xs resize-none" placeholder="Paste the Base64 signature here…" />
            </div>
          </div>
          <Button className="w-fit" onClick={() => { setVerifyError(''); try { setVerifyResult(rsaVerify(verifyMsg, verifySig.trim(), verifyPubKey)); analytics.crypto('hash_generate', { algorithm: 'RSA_VERIFY', success: true }) } catch (e) { setVerifyError(e instanceof Error ? `Verification error: ${e.message}` : 'Verification error — check the key and signature format.'); setVerifyResult(null) } }} disabled={!verifyMsg || !verifySig || !verifyPubKey}>Verify signature</Button>
          {verifyResult !== null && !verifyError && (
            <div className={`flex items-center gap-2 text-sm font-medium ${verifyResult ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {verifyResult ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {verifyResult ? 'Signature is valid — message is authentic and untampered.' : "Signature does NOT match — message was altered, or the wrong key was used."}
            </div>
          )}
          {verifyError && <div className="text-destructive text-sm font-mono">{verifyError}</div>}
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { FileDrop } from '@/components/FileDrop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'

function GenerateTab() {
  const [input, setInput] = useState('https://example.com')
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [size, setSize] = useState('256')
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')

  const generate = async () => {
    setError('')
    if (!input.trim()) return
    try {
      const url = await QRCode.toDataURL(input, {
        errorCorrectionLevel: errorLevel,
        width: parseInt(size),
        margin: 2,
        color: { dark: darkColor, light: lightColor }
      })
      setQrDataUrl(url)
    } catch (e) {
      setError(e instanceof Error ? `QR generation failed: ${e.message}` : "Couldn't generate this QR — the content might be too long for the chosen settings.")
    }
  }

  const download = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const downloadSvg = async () => {
    if (!input.trim()) return
    try {
      const svgStr = await QRCode.toString(input, {
        type: 'svg',
        errorCorrectionLevel: errorLevel,
        width: parseInt(size),
        margin: 2,
        color: { dark: darkColor, light: lightColor }
      })
      const blob = new Blob([svgStr], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.svg'
      a.click()
    } catch {}
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>What should the QR contain?</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="URL, plain text, email, phone, WiFi creds (WIFI:T:WPA;S:name;P:pass;;) …"
          onKeyDown={(e) => e.key === 'Enter' && generate()}
        />
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <Label title="Higher levels survive more damage / smudges, but make the QR denser.">Error correction</Label>
          <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as typeof errorLevel)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low — recovers ~7%</SelectItem>
              <SelectItem value="M">Medium — recovers ~15%</SelectItem>
              <SelectItem value="Q">Quartile — recovers ~25%</SelectItem>
              <SelectItem value="H">High — recovers ~30%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Size (px)</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="128">128</SelectItem>
              <SelectItem value="256">256</SelectItem>
              <SelectItem value="512">512</SelectItem>
              <SelectItem value="1024">1024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Foreground</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
            <Input value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-20 font-mono text-xs h-8 px-2" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Background</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
            <Input value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-20 font-mono text-xs h-8 px-2" />
          </div>
        </div>
        <Button onClick={generate} disabled={!input.trim()} className="mb-[2px]">Generate QR</Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {qrDataUrl && (
        <div className="flex flex-col items-start gap-3 mt-2">
          <img src={qrDataUrl} alt="Generated QR code" className="rounded-lg border border-border shadow-sm" style={{ width: Math.min(parseInt(size), 300) }} />
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={download} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSvg} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download SVG
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DecodeTab() {
  const [decoded, setDecoded] = useState('')
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = async (content: string | ArrayBuffer) => {
    setDecoded('')
    setError('')
    try {
      const jsQR = (await import('jsqr')).default
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const result = jsQR(imageData.data, imageData.width, imageData.height)
        if (result) {
          setDecoded(result.data)
        } else {
          setError("Couldn't find a QR code in this image. Try a sharper or higher-contrast picture.")
        }
      }
      img.src = typeof content === 'string' ? content : URL.createObjectURL(new Blob([content]))
    } catch (e) {
      setError(e instanceof Error ? `Decode failed: ${e.message}` : 'Decode failed — please try a different image.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas ref={canvasRef} className="hidden" />
      <FileDrop
        onFile={handleFile}
        readAs="dataURL"
        accept="image/*"
        label="Drop a QR code image (PNG / JPG / GIF) here, or click to choose one"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {decoded && (
        <div className="flex flex-col gap-1.5">
          <Label>What the QR says</Label>
          <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-sm break-all">{decoded}</div>
          {decoded.startsWith('http') && (
            <a href={decoded} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              Open link in a new tab ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function QrTool() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">QR Code</h1>
        <p className="text-xs text-muted-foreground">Build QR codes from any text or URL, or decode an existing QR image.</p>
      </div>
      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Make a QR</TabsTrigger>
          <TabsTrigger value="decode">Read a QR</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-3"><GenerateTab /></TabsContent>
        <TabsContent value="decode" className="mt-3"><DecodeTab /></TabsContent>
      </Tabs>
    </div>
  )
}

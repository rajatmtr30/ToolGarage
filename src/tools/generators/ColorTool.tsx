import { useState, useCallback } from 'react'
import { colord, extend } from 'colord'
import namesPlugin from 'colord/plugins/names'
import hwbPlugin from 'colord/plugins/hwb'
import { CopyButton } from '@/components/CopyButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

extend([namesPlugin, hwbPlugin])

interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hwb: string
  cmyk: string
  name: string | undefined
}

function parseColor(input: string): ColorFormats | null {
  try {
    const c = colord(input.trim())
    if (!c.isValid()) return null
    const rgb = c.toRgb()
    const hsl = c.toHsl()
    const hwb = c.toHwb()
    return {
      hex: c.toHex().toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
      hwb: `hwb(${Math.round(hwb.h)} ${Math.round(hwb.w)}% ${Math.round(hwb.b)}%)`,
      cmyk: (() => {
        const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
        const k = 1 - Math.max(r, g, b)
        if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)'
        const c2 = (1 - r - k) / (1 - k)
        const m = (1 - g - k) / (1 - k)
        const y = (1 - b - k) / (1 - k)
        return `cmyk(${Math.round(c2 * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`
      })(),
      name: c.toName({ closest: true }) ?? undefined,
    }
  } catch {
    return null
  }
}

function ColorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">{label}</span>
      <span className="font-mono text-sm flex-1">{value}</span>
      <CopyButton text={value} size="icon" />
    </div>
  )
}

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
}

export default function ColorTool() {
  const [pickerValue, setPickerValue] = useState('#6366f1')
  const [textInput, setTextInput] = useState('#6366f1')

  const color = parseColor(pickerValue)

  const handlePickerChange = useCallback((v: string) => {
    setPickerValue(v)
    setTextInput(v.toUpperCase())
  }, [])

  const handleTextChange = (v: string) => {
    setTextInput(v)
    const parsed = parseColor(v)
    if (parsed) setPickerValue(parsed.hex.toLowerCase())
  }

  const shades = color ? Array.from({ length: 9 }, (_, i) => {
    const lightnessTarget = 10 + i * 10
    const hsl = colord(pickerValue).toHsl()
    return colord({ ...hsl, l: lightnessTarget }).toHex()
  }) : []

  return (
    <div className="flex h-full flex-col gap-4 max-w-xl">
      <div>
        <h1 className="text-lg font-semibold">Color Studio</h1>
        <p className="text-xs text-muted-foreground">Pick a color and convert between HEX, RGB, HSL, HWB and CMYK — plus a ready-made shade ramp.</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Pick</Label>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => handlePickerChange(e.target.value)}
            className="h-9 w-16 rounded-md border border-border cursor-pointer bg-transparent"
            title="Open the system color picker"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <Label>…or type a color in any format</Label>
          <Input
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="#6366f1, rgb(99,102,241), hsl(239,84%,67%), or a name like 'indigo'"
            className="font-mono"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => handlePickerChange(randomHex())} title="Surprise me with a random color">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {color ? (
        <>
          <div className="h-16 rounded-lg border border-border" style={{ backgroundColor: color.hex }} />

          <div className="rounded-md border border-border overflow-hidden">
            <ColorRow label="HEX" value={color.hex} />
            <ColorRow label="RGB" value={color.rgb} />
            <ColorRow label="HSL" value={color.hsl} />
            <ColorRow label="HWB" value={color.hwb} />
            <ColorRow label="CMYK" value={color.cmyk} />
            {color.name && <ColorRow label="Name" value={color.name} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Shade ramp — click any swatch to switch to it</Label>
            <div className="grid grid-cols-9 gap-1">
              {shades.map((shade, i) => (
                <button
                  key={i}
                  className="group relative aspect-square rounded-md border border-border/50 transition-transform hover:scale-110 hover:z-10"
                  style={{ backgroundColor: shade }}
                  onClick={() => handlePickerChange(shade)}
                  title={shade.toUpperCase()}
                >
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block text-[10px] bg-popover border border-border rounded px-1 whitespace-nowrap font-mono">
                    {shade.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Enter a valid color and we'll show every common format.</p>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'default' | 'sm' | 'icon'
}

export function CopyButton({ text, className, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    analytics.ux('copy_output', { length: text.length })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
      title={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      disabled={!text}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {size !== 'icon' && <span>{copied ? 'Copied!' : 'Copy'}</span>}
    </Button>
  )
}

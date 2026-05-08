import { ReactNode } from 'react'
import { RotateCcw, ArrowLeftRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/CopyButton'
import { cn } from '@/lib/utils'

interface IOPanelProps {
  inputLabel?: string
  outputLabel?: string
  inputContent: ReactNode
  outputContent: ReactNode
  outputText?: string
  onClear?: () => void
  onSwap?: () => void
  onDownload?: () => void
  className?: string
  toolbar?: ReactNode
  inputToolbar?: ReactNode
  outputToolbar?: ReactNode
}

export function IOPanel({
  inputLabel = 'Input',
  outputLabel = 'Output',
  inputContent,
  outputContent,
  outputText = '',
  onClear,
  onSwap,
  onDownload,
  className,
  toolbar,
  inputToolbar,
  outputToolbar,
}: IOPanelProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Input Pane */}
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center justify-between h-7">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{inputLabel}</span>
            <div className="flex items-center gap-1">
              {inputToolbar}
              {onClear && (
                <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2 text-xs gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            {inputContent}
          </div>
        </div>

        {/* Output Pane */}
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center justify-between h-7">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{outputLabel}</span>
            <div className="flex items-center gap-1">
              {outputToolbar}
              {onSwap && (
                <Button variant="ghost" size="sm" onClick={onSwap} className="h-6 px-2 text-xs gap-1">
                  <ArrowLeftRight className="h-3 w-3" />
                  Swap
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload} className="h-6 px-2 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              )}
              <CopyButton text={outputText} size="sm" />
            </div>
          </div>
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            {outputContent}
          </div>
        </div>
      </div>
    </div>
  )
}

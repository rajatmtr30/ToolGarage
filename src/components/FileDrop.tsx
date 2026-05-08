import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropProps {
  onFile: (content: string | ArrayBuffer, fileName: string, isBase64?: boolean) => void
  accept?: string
  readAs?: 'text' | 'dataURL' | 'arrayBuffer'
  className?: string
  label?: string
}

export function FileDrop({
  onFile,
  accept,
  readAs = 'text',
  className,
  label = 'Drop a file here, or click to choose one',
}: FileDropProps) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result !== undefined && result !== null) {
          onFile(result, file.name, readAs === 'dataURL')
        }
      }
      if (readAs === 'text') reader.readAsText(file)
      else if (readAs === 'dataURL') reader.readAsDataURL(file)
      else reader.readAsArrayBuffer(file)
    },
    [onFile, readAs]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30',
        dragging && 'border-primary bg-primary/5',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <span className="text-sm text-muted-foreground text-center">{label}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </label>
  )
}

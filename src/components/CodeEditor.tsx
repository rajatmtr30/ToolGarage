import Editor, { type OnMount } from '@monaco-editor/react'
import { useTheme } from '@/hooks/useTheme'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  height?: string
  className?: string
  minimap?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  height = '100%',
  minimap = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()

  const handleMount: OnMount = (editor) => {
    editor.addCommand(
      // Prevent Cmd+K from bubbling inside Monaco (our palette uses it)
      0, // No keybinding needed — just focusing
      () => {}
    )
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
      onMount={handleMount}
      onChange={(v) => onChange?.(v ?? '')}
      options={{
        readOnly,
        minimap: { enabled: minimap },
        fontSize: 13,
        lineHeight: 20,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        padding: { top: 8, bottom: 8 },
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
        },
        renderLineHighlight: 'gutter',
        contextmenu: true,
      }}
    />
  )
}

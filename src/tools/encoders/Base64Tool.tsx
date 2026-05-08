import { useState, useEffect } from 'react'
import { FileDrop } from '@/components/FileDrop'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Download } from 'lucide-react'
import { COMMON_STRINGS } from '@/constants/common'
import { BASE64_TOOL_STRINGS } from '@/constants/Base64Tool.constants'
import './Base64Tool.css'

function TextTab() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) {
      setOutput('')
      setError('')
      return
    }
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
      setError('')
    } catch {
      setError(
        mode === 'decode'
          ? BASE64_TOOL_STRINGS.ERROR_DECODE
          : BASE64_TOOL_STRINGS.ERROR_ENCODE
      )
      setOutput('')
    }
  }, [input, mode])

  return (
    <div className="base64-tool-container">
      <div className="base64-tool-actions">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('encode')}
          title={BASE64_TOOL_STRINGS.ENCODE_TITLE}
        >{BASE64_TOOL_STRINGS.ENCODE}</Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('decode')}
          title={BASE64_TOOL_STRINGS.DECODE_TITLE}
        >{BASE64_TOOL_STRINGS.DECODE}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setInput(''); setError('') }} title={BASE64_TOOL_STRINGS.CLEAR_TITLE}>{COMMON_STRINGS.CLEAR}</Button>
      </div>
      <div className="base64-tool-grid">
        <div className="base64-tool-col">
          <span className="base64-tool-label">
            {mode === 'encode' ? BASE64_TOOL_STRINGS.PLAIN_TEXT : BASE64_TOOL_STRINGS.BASE64_STRING}
          </span>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? BASE64_TOOL_STRINGS.PLACEHOLDER_ENCODE : BASE64_TOOL_STRINGS.PLACEHOLDER_DECODE}
            className="base64-tool-textarea"
          />
        </div>
        <div className="base64-tool-col">
          <div className="base64-tool-result-header">
            <span className="base64-tool-label">
              {mode === 'encode' ? BASE64_TOOL_STRINGS.BASE64_OUTPUT : BASE64_TOOL_STRINGS.DECODED_TEXT}
            </span>
            <div className="base64-tool-result-actions">
              <Button variant="ghost" size="sm" className="base64-tool-roundtrip-btn" onClick={() => setInput(output)} title={COMMON_STRINGS.ROUND_TRIP_TITLE}>{COMMON_STRINGS.ROUND_TRIP}</Button>
              <CopyButton text={output} size="sm" />
            </div>
          </div>
          {error ? (
            <div className="base64-tool-error-box">
              {error}
            </div>
          ) : (
            <Textarea value={output} readOnly className="base64-tool-textarea-readonly" />
          )}
        </div>
      </div>
    </div>
  )
}

function FileTab() {
  const [fileName, setFileName] = useState('')
  const [b64, setB64] = useState('')

  const handleFile = (content: string | ArrayBuffer, name: string, isBase64?: boolean) => {
    if (isBase64 && typeof content === 'string') {
      setFileName(name)
      setB64(content.split(',')[1] ?? content)
    }
  }

  const download = () => {
    if (!b64) return
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName ? `${BASE64_TOOL_STRINGS.DOWNLOAD_PREFIX}${fileName}` : BASE64_TOOL_STRINGS.DEFAULT_DOWNLOAD_NAME
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="base64-tool-container">
      <FileDrop
        onFile={handleFile}
        readAs="dataURL"
        label={BASE64_TOOL_STRINGS.DROP_FILE_LABEL}
      />
      {b64 && (
        <div className="base64-tool-col">
          <div className="base64-tool-result-header">
            <span className="base64-tool-label">{BASE64_TOOL_STRINGS.BASE64_OF} <code className="base64-tool-code">{fileName}</code></span>
            <div className="base64-tool-result-actions">
              <Button variant="ghost" size="sm" className="base64-tool-save-btn" onClick={download} title={BASE64_TOOL_STRINGS.SAVE_BACK_TITLE}>
                <Download className="base64-tool-icon" /> {BASE64_TOOL_STRINGS.SAVE_BACK_AS_FILE}
              </Button>
              <CopyButton text={b64} size="sm" />
            </div>
          </div>
          <Textarea
            value={b64}
            readOnly
            className="base64-tool-textarea-break"
          />
        </div>
      )}
    </div>
  )
}

export default function Base64Tool() {
  return (
    <div className="base64-tool-wrapper">
      <div>
        <h1 className="base64-tool-header">{BASE64_TOOL_STRINGS.TITLE}</h1>
        <p className="base64-tool-description">{BASE64_TOOL_STRINGS.DESCRIPTION}</p>
      </div>
      <Tabs defaultValue="text" className="base64-tool-tabs">
        <TabsList>
          <TabsTrigger value="text">{BASE64_TOOL_STRINGS.TEXT_MODE}</TabsTrigger>
          <TabsTrigger value="file">{BASE64_TOOL_STRINGS.FILE_MODE}</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="base64-tool-tabs-content">
          <TextTab />
        </TabsContent>
        <TabsContent value="file" className="base64-tool-tabs-content">
          <FileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

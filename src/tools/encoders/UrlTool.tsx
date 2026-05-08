import { useState, useEffect } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { COMMON_STRINGS } from '@/constants/common'
import { URL_TOOL_STRINGS } from '@/constants/UrlTool.constants'
import './UrlTool.css'

const SAMPLE_URL = URL_TOOL_STRINGS.SAMPLE_URL

export default function UrlTool() {
  const [input, setInput] = useState(SAMPLE_URL)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [useComponent, setUseComponent] = useState(true)

  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) {
      setOutput('')
      setError('')
      return
    }
    try {
      if (mode === 'encode') {
        setOutput(useComponent ? encodeURIComponent(input) : encodeURI(input))
      } else {
        setOutput(useComponent ? decodeURIComponent(input) : decodeURI(input))
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : URL_TOOL_STRINGS.ERROR_INVALID_URL)
      setOutput('')
    }
  }, [input, mode, useComponent])

  const parseQueryParams = (url: string) => {
    try {
      const u = new URL(url.startsWith('http') ? url : `http://x.com/?${url}`)
      const params: [string, string][] = []
      u.searchParams.forEach((v, k) => params.push([k, v]))
      return params
    } catch {
      return []
    }
  }

  const params = parseQueryParams(input)

  return (
    <div className="url-tool-container">
      <div>
        <h1 className="url-tool-header">{URL_TOOL_STRINGS.TITLE}</h1>
        <p className="url-tool-description">{URL_TOOL_STRINGS.DESCRIPTION}</p>
      </div>

      <div className="url-tool-actions">
        <Button variant={mode === 'encode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('encode')} title={URL_TOOL_STRINGS.ENCODE_TITLE}>{URL_TOOL_STRINGS.ENCODE}</Button>
        <Button variant={mode === 'decode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('decode')} title={URL_TOOL_STRINGS.DECODE_TITLE}>{URL_TOOL_STRINGS.DECODE}</Button>
        <Button
          variant={useComponent ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setUseComponent((v) => !v)}
          title={URL_TOOL_STRINGS.MODE_TITLE}
        >
          {useComponent ? URL_TOOL_STRINGS.MODE_COMPONENT : URL_TOOL_STRINGS.MODE_FULL}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE_URL)} title={URL_TOOL_STRINGS.LOAD_SAMPLE_TITLE}>{URL_TOOL_STRINGS.LOAD_SAMPLE}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setInput(''); setError('') }}>{COMMON_STRINGS.CLEAR}</Button>
      </div>

      <div className="url-tool-grid">
        <div className="url-tool-col">
          <span className="url-tool-label">{COMMON_STRINGS.YOUR_INPUT}</span>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={URL_TOOL_STRINGS.PLACEHOLDER_INPUT}
            className="url-tool-textarea"
          />
        </div>
        <div className="url-tool-col">
          <div className="url-tool-result-header">
            <span className="url-tool-label">{COMMON_STRINGS.RESULT}</span>
            <div className="url-tool-result-actions">
              {error && <Badge variant="destructive">{URL_TOOL_STRINGS.DECODE_FAILED}</Badge>}
              <Button variant="ghost" size="sm" className="url-tool-roundtrip-btn" onClick={() => setInput(output)} title={COMMON_STRINGS.ROUND_TRIP_TITLE}>{COMMON_STRINGS.ROUND_TRIP}</Button>
              <CopyButton text={output} size="sm" />
            </div>
          </div>
          <Textarea
            value={error || output}
            readOnly
            className="url-tool-textarea-readonly"
          />
        </div>
      </div>

      {params.length > 0 && (
        <div className="url-tool-col">
          <span className="url-tool-label">{URL_TOOL_STRINGS.QUERY_PARAMS_DETECTED}</span>
          <div className="url-tool-table-container">
            <table className="url-tool-table">
              <thead className="url-tool-table-head">
                <tr>
                  <th className="url-tool-th">{URL_TOOL_STRINGS.PARAMETER}</th>
                  <th className="url-tool-th">{URL_TOOL_STRINGS.VALUE}</th>
                </tr>
              </thead>
              <tbody>
                {params.map(([k, v], i) => (
                  <tr key={i} className="url-tool-tr">
                    <td className="url-tool-td-key">{k}</td>
                    <td className="url-tool-td-val">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

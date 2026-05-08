import { useState } from 'react'
import {
  camelCase, pascalCase, snakeCase, kebabCase,
  constantCase, capitalCase, sentenceCase, dotCase, pathCase
} from 'change-case'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const CONVERSIONS = [
  { label: 'camelCase', fn: camelCase, example: 'helloWorldFoo' },
  { label: 'PascalCase', fn: pascalCase, example: 'HelloWorldFoo' },
  { label: 'snake_case', fn: snakeCase, example: 'hello_world_foo' },
  { label: 'CONSTANT_CASE', fn: constantCase, example: 'HELLO_WORLD_FOO' },
  { label: 'kebab-case', fn: kebabCase, example: 'hello-world-foo' },
  { label: 'Capital Case', fn: capitalCase, example: 'Hello World Foo' },
  { label: 'Sentence case', fn: sentenceCase, example: 'Hello world foo' },
  { label: 'dot.case', fn: dotCase, example: 'hello.world.foo' },
  { label: 'path/case', fn: pathCase, example: 'hello/world/foo' },
]

const SAMPLE = 'hello world foo bar baz'

export default function CaseTool() {
  const [input, setInput] = useState(SAMPLE)

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Case Switcher</h1>
        <p className="text-xs text-muted-foreground">Flip text between camelCase, snake_case, PascalCase, kebab-case and more — instantly.</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type a phrase or identifier</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setInput(SAMPLE)} title="Try a sample phrase">Load sample</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setInput('')}>Clear</Button>
          </div>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Words can be separated by spaces, underscores, hyphens — we'll figure it out."
          className="min-h-[80px] font-mono text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {CONVERSIONS.map(({ label, fn }) => {
          const result = input ? fn(input) : ''
          return (
            <div
              key={label}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className="font-mono text-sm truncate">{result || <span className="text-muted-foreground italic text-xs">—</span>}</span>
              </div>
              <CopyButton text={result} size="icon" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

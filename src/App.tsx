import { HashRouter, Routes, Route } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Formatters
const JsonTool = lazy(() => import('@/tools/formatters/JsonTool'))
const XmlTool = lazy(() => import('@/tools/formatters/XmlTool'))
const YamlTool = lazy(() => import('@/tools/formatters/YamlTool'))
const SqlTool = lazy(() => import('@/tools/formatters/SqlTool'))

// Viewers
const MermaidTool = lazy(() => import('@/tools/viewers/MermaidTool'))
const DiffTool = lazy(() => import('@/tools/viewers/DiffTool'))

// Encoders
const Base64Tool = lazy(() => import('@/tools/encoders/Base64Tool'))
const UrlTool = lazy(() => import('@/tools/encoders/UrlTool'))
const JwtTool = lazy(() => import('@/tools/encoders/JwtTool'))
const CaseTool = lazy(() => import('@/tools/encoders/CaseTool'))

// Crypto
const AesTool = lazy(() => import('@/tools/crypto/AesTool'))
const JasyptTool = lazy(() => import('@/tools/crypto/JasyptTool'))
const RsaTool = lazy(() => import('@/tools/crypto/RsaTool'))
const HashTool = lazy(() => import('@/tools/crypto/HashTool'))

// Generators
const UuidTool = lazy(() => import('@/tools/generators/UuidTool'))
const LoremTool = lazy(() => import('@/tools/generators/LoremTool'))
const QrTool = lazy(() => import('@/tools/generators/QrTool'))
const ColorTool = lazy(() => import('@/tools/generators/ColorTool'))
const CronTool = lazy(() => import('@/tools/generators/CronTool'))

// Converters
const TimestampTool = lazy(() => import('@/tools/converters/TimestampTool'))
const DataConverterTool = lazy(() => import('@/tools/converters/DataConverterTool'))

// Testers
const RegexTool = lazy(() => import('@/tools/testers/RegexTool'))
const HttpTool = lazy(() => import('@/tools/testers/HttpTool'))

// Home
const Home = lazy(() => import('@/tools/Home'))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Suspense fallback={<Loading />}><Home /></Suspense>} />

          <Route path="formatters">
            <Route path="json" element={<Suspense fallback={<Loading />}><JsonTool /></Suspense>} />
            <Route path="xml" element={<Suspense fallback={<Loading />}><XmlTool /></Suspense>} />
            <Route path="yaml" element={<Suspense fallback={<Loading />}><YamlTool /></Suspense>} />
            <Route path="sql" element={<Suspense fallback={<Loading />}><SqlTool /></Suspense>} />
          </Route>

          <Route path="viewers">
            <Route path="mermaid" element={<Suspense fallback={<Loading />}><MermaidTool /></Suspense>} />
            <Route path="diff" element={<Suspense fallback={<Loading />}><DiffTool /></Suspense>} />
          </Route>

          <Route path="encoders">
            <Route path="base64" element={<Suspense fallback={<Loading />}><Base64Tool /></Suspense>} />
            <Route path="url" element={<Suspense fallback={<Loading />}><UrlTool /></Suspense>} />
            <Route path="jwt" element={<Suspense fallback={<Loading />}><JwtTool /></Suspense>} />
            <Route path="case" element={<Suspense fallback={<Loading />}><CaseTool /></Suspense>} />
          </Route>

          <Route path="crypto">
            <Route path="aes" element={<Suspense fallback={<Loading />}><AesTool /></Suspense>} />
            <Route path="jasypt" element={<Suspense fallback={<Loading />}><JasyptTool /></Suspense>} />
            <Route path="rsa" element={<Suspense fallback={<Loading />}><RsaTool /></Suspense>} />
            <Route path="hash" element={<Suspense fallback={<Loading />}><HashTool /></Suspense>} />
          </Route>

          <Route path="generators">
            <Route path="uuid" element={<Suspense fallback={<Loading />}><UuidTool /></Suspense>} />
            <Route path="lorem" element={<Suspense fallback={<Loading />}><LoremTool /></Suspense>} />
            <Route path="qr" element={<Suspense fallback={<Loading />}><QrTool /></Suspense>} />
            <Route path="color" element={<Suspense fallback={<Loading />}><ColorTool /></Suspense>} />
            <Route path="cron" element={<Suspense fallback={<Loading />}><CronTool /></Suspense>} />
          </Route>

          <Route path="converters">
            <Route path="timestamp" element={<Suspense fallback={<Loading />}><TimestampTool /></Suspense>} />
            <Route path="data" element={<Suspense fallback={<Loading />}><DataConverterTool /></Suspense>} />
          </Route>

          <Route path="testers">
            <Route path="regex" element={<Suspense fallback={<Loading />}><RegexTool /></Suspense>} />
            <Route path="http" element={<Suspense fallback={<Loading />}><HttpTool /></Suspense>} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  )
}

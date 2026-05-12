# ToolGarage — All-in-One Developer Toolkit

A single-page, fully **offline** developer toolkit with 23+ utilities. Every formatter, encoder, crypto operation, and generator runs **inside your browser** — your data never leaves the page.

> Think of it as the developer workshop you keep next to your terminal: every little tool you reach for ten times a day, in one tidy place.

## What's in the garage?

| Workbench | Tools |
|---|---|
| **Formatters** | JSON Studio (with auto-repair), XML Studio, YAML Studio, SQL Studio |
| **Viewers** | Mermaid Diagrams, Text & JSON Diff |
| **Encoders** | Base64 Workshop (text + file), URL Encoder, JWT Inspector, Case Switcher |
| **Crypto** | AES Cipher (CBC / GCM / CTR), Jasypt for Spring (PBEWithMD5AndDES + PBEWITHHMACSHA512ANDAES_256), RSA Toolbox, Hash Lab (MD5 / SHA / bcrypt / HMAC) |
| **Generators** | ID Generator (UUID / ULID), Mock Data, QR Code, Color Studio, Cron Builder |
| **Converters** | Time Machine (epoch ⇄ ISO ⇄ timezone), Data Converter (JSON ⇄ YAML ⇄ XML ⇄ TOML ⇄ CSV) |
| **Testers** | Regex Playground, HTTP Sandbox |

Press **Ctrl+K** / **⌘K** anywhere to jump to any tool instantly.

## Quick start (development)

```bash
# Install dependencies
npm install

# Start the dev server at http://localhost:5173
npm run dev
```

## Production build

```bash
npm run build
# Output: dist/ — a self-contained static bundle
```

---

## Deployment options

### Option 1 — Internal nginx

```nginx
server {
    listen 80;
    server_name toolgarage.internal;
    root /var/www/toolgarage;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

Copy the `dist/` folder to `/var/www/toolgarage` and reload nginx.

### Option 2 — IIS (Windows)

1. Create a new website in IIS pointing to the `dist/` folder.
2. Add a URL Rewrite rule (or a `web.config`) to send all 404s to `index.html`:

```xml
<!-- dist/web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".wasm" mimeType="application/wasm" />
    </staticContent>
  </system.webServer>
</configuration>
```

> **Note**: Since ToolGarage uses `HashRouter` (`/#/formatters/json`), IIS rewriting is optional — direct file access works without it.

### Option 3 — Shared network drive (simplest)

Copy the `dist/` folder to a shared drive and open `dist/index.html` directly in a browser:

```
\\fileserver\shared\ToolGarage\dist\index.html
```

Because ToolGarage uses `HashRouter`, all navigation works from `file://` without any server.

### Option 4 — Docker

```bash
# Build image
docker build -t toolgarage .

# Run on port 80
docker run -d -p 80:80 toolgarage

# Access at http://localhost
```

---

## Privacy & security

- **Zero outbound network calls** from the tools themselves — all crypto, formatting, and processing runs client-side.
- `localStorage` only stores: theme preference, sidebar state, and recently used tool names. **Never** stores tool inputs, secrets, or keys.
- Works completely offline after the initial page load (or directly from a file/share).

## Jasypt algorithm notes

| Algorithm | When to use it | Spring config |
|---|---|---|
| `PBEWithMD5AndDES` | Legacy — pick this only when decrypting old values from Jasypt < 2.x | `jasypt.encryptor.algorithm=PBEWithMD5AndDES` |
| `PBEWITHHMACSHA512ANDAES_256` | The modern default for Spring Boot 2+ — use this for any new properties | `jasypt.encryptor.algorithm=PBEWITHHMACSHA512ANDAES_256` |

The default iteration count is **1000** (Jasypt's own default). Change it to match your `jasypt.encryptor.key-obtention-iterations` config value.

## Building from source

Requirements: Node.js 18+, npm 9+

```bash
git clone <repo>
cd Utility
npm install
npm run build
```

---

<p align="center">
  <b>Developed by Rajat Sharma</b><br>
  <i>Built with React, Tailwind CSS, and lots of ☕</i>
</p>

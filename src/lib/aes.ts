export type AesMode = 'CBC' | 'GCM' | 'CTR'
export type KeySize = 128 | 192 | 256

export async function generateAesKey(size: KeySize, mode: AesMode): Promise<CryptoKey> {
  const algorithm: AesKeyGenParams =
    mode === 'GCM' ? { name: 'AES-GCM', length: size } :
    mode === 'CTR' ? { name: 'AES-CTR', length: size } :
    { name: 'AES-CBC', length: size }
  return crypto.subtle.generateKey(algorithm, true, ['encrypt', 'decrypt'])
}

export async function exportKeyHex(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return Array.from(new Uint8Array(raw)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function b64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function bytesToB64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

export async function aesEncrypt(
  plaintext: string,
  keyHex: string,
  ivHex: string,
  mode: AesMode
): Promise<string> {
  const keyBytes = hexToBytes(keyHex)
  const ivBytes = hexToBytes(ivHex)
  const data = new TextEncoder().encode(plaintext)

  let algorithm: AlgorithmIdentifier | AesCbcParams | AesGcmParams | AesCtrParams
  let name: string

  if (mode === 'CBC') {
    name = 'AES-CBC'
    algorithm = { name, iv: ivBytes as BufferSource }
  } else if (mode === 'GCM') {
    name = 'AES-GCM'
    algorithm = { name, iv: ivBytes as BufferSource }
  } else {
    name = 'AES-CTR'
    algorithm = { name, counter: ivBytes as BufferSource, length: 64 }
  }

  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, { name }, false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt(algorithm, key, data as BufferSource)
  return bytesToB64(new Uint8Array(encrypted))
}

export async function aesDecrypt(
  cipherB64: string,
  keyHex: string,
  ivHex: string,
  mode: AesMode
): Promise<string> {
  const keyBytes = hexToBytes(keyHex)
  const ivBytes = hexToBytes(ivHex)
  const data = b64ToBytes(cipherB64)

  let algorithm: AlgorithmIdentifier | AesCbcParams | AesGcmParams | AesCtrParams
  let name: string

  if (mode === 'CBC') {
    name = 'AES-CBC'
    algorithm = { name, iv: ivBytes as BufferSource }
  } else if (mode === 'GCM') {
    name = 'AES-GCM'
    algorithm = { name, iv: ivBytes as BufferSource }
  } else {
    name = 'AES-CTR'
    algorithm = { name, counter: ivBytes as BufferSource, length: 64 }
  }

  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, { name }, false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt(algorithm, key, data as BufferSource)
  return new TextDecoder().decode(decrypted)
}

export function generateRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return bytesToHex(arr)
}

export async function deriveKeyPBKDF2(
  passphrase: string,
  saltHex: string,
  iterations: number,
  keySize: KeySize
): Promise<string> {
  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const salt = hexToBytes(saltHex)
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    passKey,
    keySize
  )
  return bytesToHex(new Uint8Array(bits))
}

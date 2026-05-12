/**
 * Jasypt-compatible PBE encryption / decryption.
 *
 * Supported algorithms:
 *   - PBEWithMD5AndDES        (Jasypt default, legacy)
 *   - PBEWITHHMACSHA512ANDAES_256  (secure, Spring Boot 2+)
 *
 * Wire format (same as Jasypt's StandardPBEStringEncryptor):
 *   CBC variants: [16-byte salt][16-byte IV][ciphertext]  → base64
 *   DES variant:  [8-byte salt][ciphertext]               → base64
 */

import CryptoJS from 'crypto-js'

export type JasyptAlgorithm = 'PBEWithMD5AndDES' | 'PBEWITHHMACSHA512ANDAES_256'

// ── PBEWithMD5AndDES ─────────────────────────────────────────────────────────
// key = MD5(password || salt), padded to 24 bytes for TripleDES
// Jasypt uses 1000 iterations by default

function deriveKeyDes(password: string, salt: CryptoJS.lib.WordArray, iterations: number) {
  const block = CryptoJS.lib.WordArray.create()
  block.concat(CryptoJS.enc.Utf8.parse(password))
  block.concat(salt)
  let hash = CryptoJS.MD5(block)
  for (let i = 1; i < iterations; i++) {
    hash = CryptoJS.MD5(hash)
  }
  return hash
}

export function jasyptEncryptDes(plaintext: string, password: string, iterations = 1000): string {
  const saltWords = CryptoJS.lib.WordArray.random(8)
  const hash = deriveKeyDes(password, saltWords, iterations)
  const key = CryptoJS.lib.WordArray.create(hash.words.slice(0, 2), 8)
  const iv = CryptoJS.lib.WordArray.create(hash.words.slice(2, 4), 8)
  const encrypted = CryptoJS.DES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  const combined = saltWords.concat(encrypted.ciphertext)
  return CryptoJS.enc.Base64.stringify(combined)
}

export function jasyptDecryptDes(cipherBase64: string, password: string, iterations = 1000): string {
  const combined = CryptoJS.enc.Base64.parse(cipherBase64)
  const saltWords = CryptoJS.lib.WordArray.create(combined.words.slice(0, 2), 8)
  const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(2), combined.sigBytes - 8)
  const hash = deriveKeyDes(password, saltWords, iterations)
  const key = CryptoJS.lib.WordArray.create(hash.words.slice(0, 2), 8)
  const iv = CryptoJS.lib.WordArray.create(hash.words.slice(2, 4), 8)
  const decrypted = CryptoJS.DES.decrypt(
    { ciphertext } as CryptoJS.lib.CipherParams,
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// ── PBEWITHHMACSHA512ANDAES_256 ───────────────────────────────────────────────
// key = PBKDF2(password, salt, iterations=1000, keylen=32, hash=SHA512)
// wire: [16-byte salt][16-byte IV][ciphertext] → base64

function wordArrayToUint8(wa: CryptoJS.lib.WordArray): Uint8Array {
  const bytes = new Uint8Array(wa.sigBytes)
  for (let i = 0; i < wa.sigBytes; i++) {
    bytes[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  }
  return bytes
}

function uint8ToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = []
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      ((bytes[i] || 0) << 24) |
      ((bytes[i + 1] || 0) << 16) |
      ((bytes[i + 2] || 0) << 8) |
      (bytes[i + 3] || 0)
    )
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length)
}

async function pbkdf2Sha512(password: string, salt: Uint8Array, iterations: number, keyLen: number): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password) as BufferSource, 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-512' },
    keyMaterial,
    keyLen * 8
  )
  return new Uint8Array(bits)
}

export async function jasyptEncryptAes(plaintext: string, password: string, iterations = 1000): Promise<string> {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const iv = new Uint8Array(16)
  crypto.getRandomValues(iv)
  const keyBytes = await pbkdf2Sha512(password, salt, iterations, 32)
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, { name: 'AES-CBC' }, false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv as BufferSource }, key, new TextEncoder().encode(plaintext) as BufferSource)
  const combined = new Uint8Array(16 + 16 + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, 16)
  combined.set(new Uint8Array(encrypted), 32)
  return btoa(String.fromCharCode(...combined))
}

export async function jasyptDecryptAes(cipherBase64: string, password: string, iterations = 1000): Promise<string> {
  const combined = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0))
  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 32)
  const ciphertext = combined.slice(32)
  const keyBytes = await pbkdf2Sha512(password, salt, iterations, 32)
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, { name: 'AES-CBC' }, false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv as BufferSource }, key, ciphertext as BufferSource)
  return new TextDecoder().decode(decrypted)
}

// ── Unified API ───────────────────────────────────────────────────────────────

export async function jasyptEncrypt(
  plaintext: string,
  password: string,
  algorithm: JasyptAlgorithm,
  iterations = 1000
): Promise<string> {
  if (algorithm === 'PBEWITHHMACSHA512ANDAES_256') {
    return jasyptEncryptAes(plaintext, password, iterations)
  }
  return jasyptEncryptDes(plaintext, password, iterations)
}

export async function jasyptDecrypt(
  cipherBase64: string,
  password: string,
  algorithm: JasyptAlgorithm,
  iterations = 1000
): Promise<string> {
  if (algorithm === 'PBEWITHHMACSHA512ANDAES_256') {
    return jasyptDecryptAes(cipherBase64, password, iterations)
  }
  return jasyptDecryptDes(cipherBase64, password, iterations)
}

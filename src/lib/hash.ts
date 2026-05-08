import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512' | 'SHA-224' | 'SHA-384' | 'bcrypt'

export interface HashResult {
  algorithm: HashAlgorithm
  hex: string
  base64: string
}

export function computeHash(input: string, algorithm: HashAlgorithm): Omit<HashResult, 'algorithm'> {
  let wa: CryptoJS.lib.WordArray

  switch (algorithm) {
    case 'MD5': wa = CryptoJS.MD5(input); break
    case 'SHA-1': wa = CryptoJS.SHA1(input); break
    case 'SHA-224': wa = CryptoJS.SHA224(input); break
    case 'SHA-256': wa = CryptoJS.SHA256(input); break
    case 'SHA-384': wa = CryptoJS.SHA384(input); break
    case 'SHA-512': wa = CryptoJS.SHA512(input); break
    default: throw new Error(`Unknown algorithm: ${algorithm}`)
  }

  return {
    hex: wa.toString(CryptoJS.enc.Hex),
    base64: wa.toString(CryptoJS.enc.Base64),
  }
}

export async function computeAllHashes(input: string): Promise<HashResult[]> {
  const algorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512']
  return algorithms.map((algorithm) => ({
    algorithm,
    ...computeHash(input, algorithm),
  }))
}

export async function bcryptHash(input: string, rounds: number): Promise<string> {
  const salt = await bcrypt.genSalt(rounds)
  return bcrypt.hash(input, salt)
}

export async function bcryptVerify(input: string, hash: string): Promise<boolean> {
  return bcrypt.compare(input, hash)
}

export function hmac(input: string, key: string, algorithm: 'MD5' | 'SHA-256' | 'SHA-512'): string {
  let result: CryptoJS.lib.WordArray
  switch (algorithm) {
    case 'MD5': result = CryptoJS.HmacMD5(input, key); break
    case 'SHA-256': result = CryptoJS.HmacSHA256(input, key); break
    case 'SHA-512': result = CryptoJS.HmacSHA512(input, key); break
  }
  return result.toString(CryptoJS.enc.Hex)
}

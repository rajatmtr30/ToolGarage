import forge from 'node-forge'

export type RsaKeySize = 1024 | 2048 | 4096
export type RsaPadding = 'PKCS1' | 'OAEP'

export interface RsaKeyPair {
  publicKey: string
  privateKey: string
}

export function generateRsaKeyPair(bits: RsaKeySize): Promise<RsaKeyPair> {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits, workers: 2 }, (err, keypair) => {
      if (err) return reject(err)
      resolve({
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
      })
    })
  })
}

function getPublicKey(pem: string): forge.pki.rsa.PublicKey {
  return forge.pki.publicKeyFromPem(pem)
}

function getPrivateKey(pem: string): forge.pki.rsa.PrivateKey {
  return forge.pki.privateKeyFromPem(pem)
}

export function rsaEncrypt(plaintext: string, publicKeyPem: string, padding: RsaPadding = 'OAEP'): string {
  const key = getPublicKey(publicKeyPem)
  const encrypted =
    padding === 'OAEP'
      ? key.encrypt(forge.util.encodeUtf8(plaintext), 'RSA-OAEP', { md: forge.md.sha256.create() })
      : key.encrypt(forge.util.encodeUtf8(plaintext), 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(encrypted)
}

export function rsaDecrypt(cipherBase64: string, privateKeyPem: string, padding: RsaPadding = 'OAEP'): string {
  const key = getPrivateKey(privateKeyPem)
  const decoded = forge.util.decode64(cipherBase64)
  const decrypted =
    padding === 'OAEP'
      ? key.decrypt(decoded, 'RSA-OAEP', { md: forge.md.sha256.create() })
      : key.decrypt(decoded, 'RSAES-PKCS1-V1_5')
  return forge.util.decodeUtf8(decrypted)
}

export function rsaSign(message: string, privateKeyPem: string): string {
  const key = getPrivateKey(privateKeyPem)
  const md = forge.md.sha256.create()
  md.update(message, 'utf8')
  const signature = key.sign(md)
  return forge.util.encode64(signature)
}

export function rsaVerify(message: string, signatureBase64: string, publicKeyPem: string): boolean {
  try {
    const key = getPublicKey(publicKeyPem)
    const md = forge.md.sha256.create()
    md.update(message, 'utf8')
    return key.verify(md.digest().bytes(), forge.util.decode64(signatureBase64))
  } catch {
    return false
  }
}

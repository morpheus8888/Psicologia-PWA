import { Buffer } from 'buffer'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const base64ToUint8Array = (value: string) => {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    return bytes
  }

  const buffer = Buffer.from(value, 'base64')
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

const uint8ArrayToBase64 = (value: Uint8Array) => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    let binary = ''
    for (let index = 0; index < value.length; index += 1) {
      binary += String.fromCharCode(value[index])
    }
    return window.btoa(binary)
  }

  return Buffer.from(value).toString('base64')
}

const getKeyMaterial = async (password: string) => {
  if (!password) throw new Error('Password richiesta per derivare la chiave')
  return crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
}

export const deriveEncryptionKey = async (password: string, saltBase64: string) => {
  const keyMaterial = await getKeyMaterial(password)
  const salt = base64ToUint8Array(saltBase64)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 310000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export const encryptDiaryContent = async (key: CryptoKey, plaintext: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = encoder.encode(plaintext)
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded))
  const combined = new Uint8Array(iv.length + encrypted.length)
  combined.set(iv, 0)
  combined.set(encrypted, iv.length)
  return uint8ArrayToBase64(combined)
}

export const decryptDiaryContent = async (key: CryptoKey, payload: string) => {
  const combined = base64ToUint8Array(payload)
  const iv = combined.subarray(0, 12)
  const ciphertext = combined.subarray(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return decoder.decode(decrypted)
}

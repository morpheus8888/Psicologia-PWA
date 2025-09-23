import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.DIARY_ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  console.warn('[DiaryEncryption] Missing DIARY_ENCRYPTION_KEY; set it to guarantee encrypted storage.')
}

const ensureKey = () => {
  if (!ENCRYPTION_KEY) {
    throw new Error('DIARY_ENCRYPTION_KEY env var is required for diary encryption')
  }
  return ENCRYPTION_KEY
}

const deriveKey = (userId: string) => {
  const secret = ensureKey()
  return crypto.createHash('sha256').update(`${secret}:${userId}`).digest()
}

export const encryptDiaryText = (userId: string, plaintext: string) => {
  const key = deriveKey(userId)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export const decryptDiaryText = (userId: string, payload?: string | null) => {
  if (!payload) return null
  try {
    const buffer = Buffer.from(payload, 'base64')
    const iv = buffer.subarray(0, 12)
    const authTag = buffer.subarray(12, 28)
    const encryptedData = buffer.subarray(28)
    const key = deriveKey(userId)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
    return decrypted.toString('utf8')
  } catch (error) {
    // fallback for entries salvaged prima della cifratura
    return payload
  }
}

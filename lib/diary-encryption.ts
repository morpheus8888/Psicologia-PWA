import crypto from 'crypto'

const MASTER_SECRET = process.env.DIARY_MASTER_KEY || process.env.DIARY_ENCRYPTION_KEY

if (!MASTER_SECRET) {
  console.warn('[DiaryEncryption] Missing DIARY_MASTER_KEY (or legacy DIARY_ENCRYPTION_KEY); set it to guarantee encrypted storage.')
}

const getMasterKey = () => {
  if (!MASTER_SECRET) {
    throw new Error('DIARY_MASTER_KEY env var is required for diary encryption')
  }
  // Normalizziamo la lunghezza a 32 byte tramite SHA-256
  return crypto.createHash('sha256').update(MASTER_SECRET).digest()
}

export const deriveUserKey = (userId: string) => {
  const masterKey = getMasterKey()
  return crypto.createHmac('sha256', masterKey).update(userId).digest()
}

const encryptWithKey = (key: Buffer, plaintext: string) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

const decryptWithKey = (key: Buffer, payload?: string | null) => {
  if (!payload) return null
  try {
    const buffer = Buffer.from(payload, 'base64')
    const iv = buffer.subarray(0, 12)
    const authTag = buffer.subarray(12, 28)
    const encryptedData = buffer.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
    return decrypted.toString('utf8')
  } catch (error) {
    return null
  }
}

export const encryptDiaryText = (userId: string, plaintext: string) => {
  const key = deriveUserKey(userId)
  return encryptWithKey(key, plaintext)
}

export const decryptDiaryText = (userId: string, payload?: string | null) => {
  return decryptWithKey(deriveUserKey(userId), payload)
}

export const createDiaryPasswordRecord = async (password: string) => {
  const salt = crypto.randomBytes(16)
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(key as Buffer)
    })
  })
  const hash = crypto.createHash('sha256').update(derived).digest('hex')
  return {
    salt: salt.toString('base64'),
    hash,
  }
}

export const verifyDiaryPassword = async (password: string, saltBase64?: string | null, hash?: string | null) => {
  if (!saltBase64 || !hash) return false
  const salt = Buffer.from(saltBase64, 'base64')
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(key as Buffer)
    })
  })
  const digest = crypto.createHash('sha256').update(derived).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(hash, 'utf8'))
}

export const hashDiaryPasswordWithSalt = async (password: string, saltBase64: string) => {
  const salt = Buffer.from(saltBase64, 'base64')
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(key as Buffer)
    })
  })
  return crypto.createHash('sha256').update(derived).digest('hex')
}

export const decryptDiaryTextWithKey = (key: Buffer, payload?: string | null) => decryptWithKey(key, payload)
export const encryptDiaryTextWithKey = (key: Buffer, plaintext: string) => encryptWithKey(key, plaintext)

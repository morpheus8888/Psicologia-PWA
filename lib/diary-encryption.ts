import crypto from 'crypto'

const LEGACY_MASTER_SECRET = process.env.DIARY_MASTER_KEY || process.env.DIARY_ENCRYPTION_KEY || null

const getLegacyMasterKey = () => {
  if (!LEGACY_MASTER_SECRET) {
    throw new Error('Legacy diary master key missing')
  }
  return crypto.createHash('sha256').update(LEGACY_MASTER_SECRET).digest()
}

export const hasLegacyDiaryMasterKey = () => LEGACY_MASTER_SECRET !== null

export const decryptLegacyDiaryText = (userId: string, payload?: string | null) => {
  if (!payload) return null
  try {
    const key = crypto.createHmac('sha256', getLegacyMasterKey()).update(userId).digest()
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

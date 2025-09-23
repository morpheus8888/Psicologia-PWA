export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

export function ensureJwtSecret(): string {
  try {
    return getJwtSecret()
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET environment variable not set')
  }
  return secret
}


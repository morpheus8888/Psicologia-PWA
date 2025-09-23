import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

async function ensureAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new Error('UNAUTHORIZED')
  }

  const secret = getJwtSecret()
  const decoded = jwt.verify(token, secret) as { sub: string }
  const admin = await prisma.user.findUnique({ where: { id: decoded.sub } })

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }

  return { adminId: admin.id }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { adminId } = await ensureAdmin(req)
    const { id } = req.query
    const { newPassword } = req.body as { newPassword?: string }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utente richiesto' })
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'La nuova password deve avere almeno 8 caratteri' })
    }

    if (id === adminId) {
      return res.status(400).json({ error: 'Usa la pagina profilo per cambiare la tua password' })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id },
      data: { password: hashed }
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Token mancante' })
    }
    if (error?.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    console.error('Error updating user password:', error)
    return res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' })
  }
}

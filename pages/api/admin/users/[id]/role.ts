import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

const ALLOWED_ROLES = ['ADMIN', 'PROFESSIONAL', 'CLIENT'] as const

type AllowedRole = (typeof ALLOWED_ROLES)[number]

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
    const { role } = req.body as { role?: AllowedRole }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utente richiesto' })
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Ruolo non valido' })
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (target.id === adminId && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Non puoi rimuovere i tuoi privilegi di amministratore' })
    }

    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      const otherAdmins = await prisma.user.count({
        where: {
          id: { not: target.id },
          role: 'ADMIN'
        }
      })
      if (otherAdmins === 0) {
        return res.status(400).json({ error: 'Deve esistere almeno un altro amministratore' })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        diaryVisibility: true,
        phone: true,
      }
    })

    return res.status(200).json({ user: { ...updatedUser, isAdmin: updatedUser.role === 'ADMIN' } })
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
    console.error('Error updating user role:', error)
    return res.status(500).json({ error: 'Errore durante l\'aggiornamento del ruolo' })
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

const VISIBILITY_OPTIONS = ['PRIVATE', 'PROFESSIONALS', 'PUBLIC'] as const

type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as { sub: string }
    const { visibility } = req.body as { visibility?: VisibilityOption }

    if (!visibility || !VISIBILITY_OPTIONS.includes(visibility)) {
      return res.status(400).json({ error: 'Visibilità non valida' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: { diaryVisibility: visibility },
      select: {
        id: true,
        email: true,
        avatar: true,
        nickname: true,
        phone: true,
        role: true,
        diaryVisibility: true,
        diaryPasswordHash: true,
      }
    })

    const { diaryPasswordHash, ...safeUser } = updatedUser

    res.status(200).json({
      user: {
        ...safeUser,
        isAdmin: updatedUser.role === 'ADMIN',
        hasDiaryPassword: !!diaryPasswordHash,
      }
    })
  } catch (error) {
    console.error('Error updating diary visibility:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della visibilità' })
  }
}

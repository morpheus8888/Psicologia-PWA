import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as { sub: string }

    const count = await prisma.message.count({
      where: {
        userId: decoded.sub,
        isRead: false,
      },
    })

    return res.status(200).json({ count })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    return res.status(500).json({ error: 'Errore durante il calcolo dei messaggi non letti' })
  }
}

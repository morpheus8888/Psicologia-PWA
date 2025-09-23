import { NextApiRequest, NextApiResponse } from 'next'
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
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    })

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        diaryVisibility: true,
        avatar: true,
        nickname: true,
        phone: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({
      users: users.map((record) => ({
        ...record,
        isAdmin: record.role === 'ADMIN',
      }))
    })
  } catch (error) {
    console.error('Error loading users:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante il caricamento degli utenti' })
  }
}

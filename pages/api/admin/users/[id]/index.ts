import { NextApiRequest, NextApiResponse } from 'next'
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
  if (req.method !== 'DELETE' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { adminId } = await ensureAdmin(req)
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utente richiesto' })
    }

    if (adminId === id && req.method === 'DELETE') {
      return res.status(400).json({ error: 'Non puoi eliminare te stesso' })
    }

    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar: true,
          phone: true,
          role: true,
          diaryVisibility: true,
          createdAt: true,
          messages: {
            select: { id: true, title: true, createdAt: true, isRead: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              diaryEntries: true,
              messages: true,
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' })
      }

      return res.status(200).json({ user: { ...user, isAdmin: user.role === 'ADMIN' } })
    }

    await prisma.user.delete({ where: { id } })
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
    console.error('Error handling admin user request:', error)
    return res.status(500).json({ error: 'Errore inaspettato' })
  }
}

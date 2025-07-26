import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }

    const messages = await prisma.message.findMany({
      where: {
        userId: decoded.sub
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({ messages })
  } catch (error) {
    console.error('Error loading messages:', error)
    res.status(500).json({ error: 'Errore durante il caricamento dei messaggi' })
  }
}
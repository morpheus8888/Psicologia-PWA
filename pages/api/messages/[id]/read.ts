import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/get-jwt-secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured' })
    }
    const decoded = jwt.verify(token, secret) as { sub: string }
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID messaggio richiesto' })
    }

    // Update message as read, but only if it belongs to the current user
    const message = await prisma.message.updateMany({
      where: {
        id: id,
        userId: decoded.sub
      },
      data: {
        isRead: true
      }
    })

    if (message.count === 0) {
      return res.status(404).json({ error: 'Messaggio non trovato' })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del messaggio' })
  }
}
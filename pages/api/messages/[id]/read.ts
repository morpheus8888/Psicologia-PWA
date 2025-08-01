import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.cookies.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID messaggio richiesto' })
    }

    // Update message as read, but only if it belongs to the current user
    const message = await prisma.message.updateMany({
      where: {
        id: id,
        userId: userId
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
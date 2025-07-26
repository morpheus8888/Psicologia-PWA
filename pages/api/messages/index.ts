import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.cookies.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const messages = await prisma.message.findMany({
      where: {
        userId: userId
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
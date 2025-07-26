import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/get-jwt-secret'

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
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured' })
    }
    const decoded = jwt.verify(token, secret) as { sub: string }
    
    const entries = await prisma.diaryEntry.findMany({
      where: { userId: decoded.sub },
      select: { date: true, mood: true }
    })

    const dates = entries.map(entry => entry.date.toISOString().split('T')[0])
    const moods = entries.reduce((acc, entry) => {
      const dateStr = entry.date.toISOString().split('T')[0]
      acc[dateStr] = entry.mood
      return acc
    }, {} as Record<string, string | null>)
    
    res.status(200).json({ dates, moods })
  } catch (error) {
    console.error('Error loading diary dates:', error)
    res.status(500).json({ error: 'Errore durante il caricamento delle date' })
  }
}
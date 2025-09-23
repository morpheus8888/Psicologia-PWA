import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import { verifyDiaryPassword } from '@/lib/diary-encryption'

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
    const diaryPassword = req.headers['x-diary-password']

    if (!diaryPassword || typeof diaryPassword !== 'string') {
      return res.status(400).json({ error: 'Password diario richiesta' })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        diaryPasswordSalt: true,
        diaryPasswordHash: true,
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.diaryPasswordHash) {
      return res.status(400).json({ error: 'Imposta prima una password per il diario nelle impostazioni' })
    }

    const passwordValid = await verifyDiaryPassword(diaryPassword, user.diaryPasswordSalt, user.diaryPasswordHash)

    if (!passwordValid) {
      return res.status(400).json({ error: 'Password diario non corretta' })
    }
    
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
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante il caricamento delle date' })
  }
}

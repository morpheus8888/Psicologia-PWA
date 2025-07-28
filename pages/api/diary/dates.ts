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
    
    const entries = await prisma.diaryEntry.findMany({
      where: { userId },
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
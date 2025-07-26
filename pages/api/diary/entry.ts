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
    const { date } = req.query

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Data richiesta' })
    }

    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number)
    const entryDate = new Date(year, month - 1, day)
    
    const entry = await prisma.diaryEntry.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: entryDate
        }
      }
    })

    res.status(200).json({ entry })
  } catch (error) {
    console.error('Error loading diary entry:', error)
    res.status(500).json({ error: 'Errore durante il caricamento della voce' })
  }
}
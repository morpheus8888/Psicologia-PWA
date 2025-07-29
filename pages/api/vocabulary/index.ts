import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.cookies.userId
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    const entries = await prisma.vocabularyEntry.findMany({
      where: {
        term: {
          contains: q,
          mode: 'insensitive'
        }
      },
      orderBy: { term: 'asc' }
    })
    return res.status(200).json({ entries })
  }

  if (req.method === 'POST') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato' })
    }

    const { term, definition } = req.body
    if (!term || !definition) {
      return res.status(400).json({ error: 'Termine e definizione richiesti' })
    }

    try {
      const entry = await prisma.vocabularyEntry.create({ data: { term, definition } })
      return res.status(200).json({ entry })
    } catch (error) {
      console.error('Error creating entry:', error)
      return res.status(500).json({ error: 'Errore durante la creazione' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

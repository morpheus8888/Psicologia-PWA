import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, secret) as { sub: string }
    const { phone } = req.body

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ error: 'Numero di telefono richiesto' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: { phone: phone.trim() },
      select: {
        id: true,
        email: true,
        avatar: true,
        nickname: true,
        phone: true
      }
    })

    res.status(200).json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating phone:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del telefono' })
  }
}
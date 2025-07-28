import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.cookies.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email valida richiesta' })
    }

    // Controlla se l'email è già in uso da un altro utente
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        NOT: { id: userId }
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email già in uso' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        avatar: true,
        nickname: true,
        phone: true,
        isAdmin: true
      }
    })

    res.status(200).json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating email:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'email' })
  }
}
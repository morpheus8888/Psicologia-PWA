import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    })

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato' })
    }

    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'Titolo e contenuto richiesti' })
    }

    // Get all users (except admins, or include them if you want)
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false // Send only to non-admin users
      },
      select: {
        id: true
      }
    })

    // Create messages for all users
    const messageData = users.map(user => ({
      title,
      content,
      userId: user.id
    }))

    await prisma.message.createMany({
      data: messageData
    })

    res.status(200).json({ 
      success: true, 
      sentTo: users.length,
      message: `Messaggio inviato a ${users.length} utenti` 
    })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Errore durante l\'invio del messaggio' })
  }
}
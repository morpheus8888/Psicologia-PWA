import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import sanitizeHtml from 'sanitize-html'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as { sub: string }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    })

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }

    const { title, content } = req.body as { title?: string; content?: string }

    const cleanedTitle = sanitizeHtml(title ?? '', {
      allowedTags: [],
      allowedAttributes: {},
    }).trim()

    const cleanedContent = sanitizeHtml(content ?? '', {
      allowedTags: ['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {},
      textFilter: (text) => text.trimStart(),
    }).trim()

    if (!cleanedTitle || !cleanedContent) {
      return res.status(400).json({ error: 'Titolo e contenuto richiesti' })
    }

    // Broadcast to every registered account, including administrators
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
    })

    // Create messages for all users
    const messageData = users.map(user => ({
      title: cleanedTitle,
      content: cleanedContent,
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
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante l\'invio del messaggio' })
  }
}

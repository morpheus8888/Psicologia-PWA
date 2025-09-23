import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

async function ensureAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new Error('UNAUTHORIZED')
  }

  const secret = getJwtSecret()
  const decoded = jwt.verify(token, secret) as { sub: string }
  const admin = await prisma.user.findUnique({ where: { id: decoded.sub } })

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }

  return { adminId: admin.id }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { adminId } = await ensureAdmin(req)
    const { id } = req.query
    const { title, content } = req.body as { title?: string; content?: string }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utente richiesto' })
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Titolo e contenuto richiesti' })
    }

    const recipient = await prisma.user.findUnique({ where: { id } })
    if (!recipient) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const sanitizedTitle = sanitizeHtml(title, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim()

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {},
    }).trim()

    if (!sanitizedTitle || !sanitizedContent) {
      return res.status(400).json({ error: 'Titolo o contenuto non valido' })
    }

    await prisma.message.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        userId: id,
      }
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Token mancante' })
    }
    if (error?.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    console.error('Error sending user message:', error)
    return res.status(500).json({ error: 'Errore durante l\'invio del messaggio' })
  }
}

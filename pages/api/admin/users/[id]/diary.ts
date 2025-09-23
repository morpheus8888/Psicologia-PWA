import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import { decryptDiaryText } from '@/lib/diary-encryption'

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await ensureAdmin(req)
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utente richiesto' })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, diaryVisibility: true }
    })

    if (!target) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (target.diaryVisibility !== 'PUBLIC') {
      return res.status(403).json({ error: 'Il diario di questo utente non è pubblico' })
    }

    const entries = await prisma.diaryEntry.findMany({
      where: { userId: id },
      orderBy: { date: 'desc' }
    })

    const decrypted = entries.map((entry) => {
      const text = entry.freeText ? decryptDiaryText(id, entry.freeText) : null
      const safeText = text
        ? sanitizeHtml(text, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              img: ['src', 'alt'],
            },
            allowedSchemes: ['data', 'http', 'https', 'mailto'],
          })
        : null

      return {
        ...entry,
        freeText: safeText,
      }
    })

    return res.status(200).json({ entries: decrypted })
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Token mancante' })
    }
    if (error?.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }
    if (error instanceof Error && error.message.includes('DIARY_ENCRYPTION_KEY')) {
      return res.status(500).json({ error: 'DIARY_ENCRYPTION_KEY non configurata sul server' })
    }
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    console.error('Error fetching public diary:', error)
    return res.status(500).json({ error: 'Errore durante il recupero del diario' })
  }
}

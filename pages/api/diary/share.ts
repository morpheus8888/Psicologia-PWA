import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import { verifyDiaryPassword } from '@/lib/diary-encryption'

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt'],
  },
  allowedSchemes: ['data', 'http', 'https', 'mailto'],
}

const ensureAuthenticatedUser = async (req: NextApiRequest) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new Error('UNAUTHORIZED')
  }
  const secret = getJwtSecret()
  const decoded = jwt.verify(token, secret) as { sub: string }
  return decoded.sub
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await ensureAuthenticatedUser(req)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        diaryVisibility: true,
        diaryPasswordSalt: true,
        diaryPasswordHash: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.diaryPasswordHash) {
      return res.status(400).json({ error: 'Imposta prima una password per il diario nelle impostazioni' })
    }

    if (user.diaryVisibility !== 'PUBLIC') {
      return res.status(400).json({ error: 'Condividi il diario impostando la visibilità su "Tutti" nelle impostazioni.' })
    }

    if (req.method === 'POST') {
      const { date, content, diaryPassword } = req.body as {
        date?: string
        content?: string
        diaryPassword?: string
      }

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Data richiesta' })
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Contenuto richiesto per condividere la voce' })
      }

      if (!diaryPassword) {
        return res.status(400).json({ error: 'Password diario richiesta' })
      }

      const passwordValid = await verifyDiaryPassword(
        diaryPassword,
        user.diaryPasswordSalt,
        user.diaryPasswordHash
      )

      if (!passwordValid) {
        return res.status(400).json({ error: 'Password diario non corretta' })
      }

      const [year, month, day] = date.split('-').map(Number)
      const entryDate = new Date(year, month - 1, day)

      const sanitized = sanitizeHtml(content, sanitizeOptions).trim()

      if (!sanitized) {
        return res.status(400).json({ error: 'Public content is empty or invalid' })
      }

      const entry = await prisma.diaryEntry.update({
        where: {
          userId_date: {
            userId,
            date: entryDate,
          },
        },
        data: {
          publicText: sanitized,
          publicSharedAt: new Date(),
        },
        select: {
          id: true,
          publicText: true,
          publicSharedAt: true,
        },
      })

      return res.status(200).json({
        entry,
      })
    }

    if (req.method === 'DELETE') {
      const { date, diaryPassword } = req.body as {
        date?: string
        diaryPassword?: string
      }

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Data richiesta' })
      }

      if (!diaryPassword) {
        return res.status(400).json({ error: 'Password diario richiesta' })
      }

      const passwordValid = await verifyDiaryPassword(
        diaryPassword,
        user.diaryPasswordSalt,
        user.diaryPasswordHash
      )

      if (!passwordValid) {
        return res.status(400).json({ error: 'Password diario non corretta' })
      }

      const [year, month, day] = date.split('-').map(Number)
      const entryDate = new Date(year, month - 1, day)

      const entry = await prisma.diaryEntry.update({
        where: {
          userId_date: {
            userId,
            date: entryDate,
          },
        },
        data: {
          publicText: null,
          publicSharedAt: null,
        },
        select: {
          id: true,
        },
      })

      return res.status(200).json({ entry })
    }

    res.setHeader('Allow', 'POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Token mancante' })
    }
    console.error('Error sharing diary entry:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Voce del diario non trovata' })
    }
    return res.status(500).json({ error: 'Errore durante l\'aggiornamento della condivisione del diario' })
  }
}

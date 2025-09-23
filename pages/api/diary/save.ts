import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import { encryptDiaryText, verifyDiaryPassword } from '@/lib/diary-encryption'

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

    const { date, freeText, mood, diaryPassword } = req.body as {
      date?: string
      freeText?: string
      mood?: string
      diaryPassword?: string
    }

    if (!date) {
      return res.status(400).json({ error: 'Data richiesta' })
    }

    // Parse the entry date - handle timezone issues by parsing as local date
    const [year, month, day] = date.split('-').map(Number)
    const entryDate = new Date(year, month - 1, day)

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        diaryPasswordHash: true,
        diaryPasswordSalt: true,
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.diaryPasswordHash) {
      return res.status(400).json({ error: 'Imposta prima una password per il diario nelle impostazioni' })
    }

    if (!diaryPassword) {
      return res.status(400).json({ error: 'Password diario richiesta' })
    }

    const passwordValid = await verifyDiaryPassword(diaryPassword, user.diaryPasswordSalt, user.diaryPasswordHash)

    if (!passwordValid) {
      return res.status(400).json({ error: 'Password diario non corretta' })
    }

    const sanitizedFreeText = freeText && freeText.trim().length > 0
      ? sanitizeHtml(freeText, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt'],
          },
          allowedSchemes: ['data', 'http', 'https', 'mailto'],
        })
      : null

    if (!sanitizedFreeText && (!mood || mood.trim() === '')) {
      return res.status(400).json({ error: 'Contenuto o umore richiesto' })
    }

    const encryptedText = sanitizedFreeText
      ? encryptDiaryText(decoded.sub, sanitizedFreeText)
      : null

    const entry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: decoded.sub,
          date: entryDate
        }
      },
      update: { freeText: encryptedText, mood: mood || null },
      create: {
        userId: decoded.sub,
        date: entryDate,
        freeText: encryptedText,
        mood: mood || null,
      }
    })

    res.status(200).json({
      entry: {
        ...entry,
        freeText: sanitizedFreeText,
      }
    })
  } catch (error) {
    console.error('Error saving diary entry:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    if (error instanceof Error && error.message.includes('DIARY_MASTER_KEY')) {
      return res.status(500).json({ error: 'DIARY_MASTER_KEY non configurata sul server' })
    }
    res.status(500).json({ error: 'Errore durante il salvataggio della voce' })
  }
}

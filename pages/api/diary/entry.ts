import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as { sub: string }
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
          userId: decoded.sub,
          date: entryDate
        }
      }
    })

    const sanitizedEntry = entry
      ? {
          ...entry,
          freeText: entry.freeText
            ? sanitizeHtml(entry.freeText, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt'],
                },
                allowedSchemes: ['data', 'http', 'https', 'mailto'],
              })
            : null,
        }
      : null

    res.status(200).json({ entry: sanitizedEntry })
  } catch (error) {
    console.error('Error loading diary entry:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante il caricamento della voce' })
  }
}

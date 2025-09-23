import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'
import { createDiaryPasswordRecord, verifyDiaryPassword } from '@/lib/diary-encryption'

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
    const { currentPassword, newPassword, confirmPassword } = req.body as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'La nuova password è obbligatoria' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Le password non coincidono' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La password deve avere almeno 8 caratteri' })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        diaryPasswordSalt: true,
        diaryPasswordHash: true,
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (user.diaryPasswordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Inserisci la password attuale' })
      }
      const valid = await verifyDiaryPassword(currentPassword, user.diaryPasswordSalt, user.diaryPasswordHash)
      if (!valid) {
        return res.status(400).json({ error: 'Password attuale non corretta' })
      }
    }

    const record = await createDiaryPasswordRecord(newPassword)

    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: {
        diaryPasswordHash: record.hash,
        diaryPasswordSalt: record.salt,
      },
      select: {
        id: true,
        email: true,
        avatar: true,
        nickname: true,
        phone: true,
        role: true,
        diaryVisibility: true,
        diaryPasswordHash: true,
      }
    })

    const { diaryPasswordHash, ...safeUser } = updatedUser

    res.status(200).json({
      user: {
        ...safeUser,
        isAdmin: updatedUser.role === 'ADMIN',
        hasDiaryPassword: !!diaryPasswordHash,
      }
    })
  } catch (error) {
    console.error('Error updating diary password:', error)
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password del diario' })
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
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

    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Tutti i campi password sono richiesti' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Le nuove password non coincidono' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nuova password deve essere di almeno 6 caratteri' })
    }

    // Verifica la password attuale
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password attuale incorretta' })
    }

    // Hash della nuova password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    res.status(200).json({ message: 'Password aggiornata con successo' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' })
  }
}
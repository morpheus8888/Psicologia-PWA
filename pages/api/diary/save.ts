import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/get-jwt-secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📥 API Save called:', { method: req.method, body: req.body })
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    console.log('🔑 Token check:', { hasToken: !!token })
    
    if (!token) {
      console.log('❌ No token provided')
      return res.status(401).json({ error: 'Token mancante' })
    }

    const secret = getJwtSecret()
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured' })
    }
    const decoded = jwt.verify(token, secret) as { sub: string }
    console.log('👤 Token decoded:', { userId: decoded.sub })
    
    const { date, freeText, mood } = req.body
    console.log('📝 Request data:', { date, freeTextLength: freeText?.length, mood })

    if (!date) {
      console.log('❌ No date provided')
      return res.status(400).json({ error: 'Data richiesta' })
    }
    
    if (!freeText || freeText.trim() === '') {
      console.log('❌ No content provided')
      return res.status(400).json({ error: 'Contenuto richiesto' })
    }

    // Parse the entry date - handle timezone issues by parsing as local date
    const [year, month, day] = date.split('-').map(Number)
    const entryDate = new Date(year, month - 1, day)
    console.log('📅 Entry date parsed as local:', { input: date, parsed: entryDate.toISOString() })

    // Prepare the data to save
    const dataToSave = { freeText, mood }
    console.log('💾 Data to save:', dataToSave)
    
    console.log('🔍 Attempting upsert with:', { userId: decoded.sub, date: entryDate.toISOString() })
    
    const entry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: decoded.sub,
          date: entryDate
        }
      },
      update: dataToSave,
      create: {
        userId: decoded.sub,
        date: entryDate,
        ...dataToSave
      }
    })

    console.log('✅ Entry saved successfully:', entry.id)
    res.status(200).json({ entry })
  } catch (error) {
    console.error('Error saving diary entry:', error)
    res.status(500).json({ error: 'Errore durante il salvataggio della voce' })
  }
}
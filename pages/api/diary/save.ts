import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📥 API Save called:', { method: req.method, body: req.body })
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.cookies.userId
    console.log('🔑 Token check:', { hasUser: !!userId })

    if (!userId) {
      console.log('❌ No user cookie')
      return res.status(401).json({ error: 'Not authenticated' })
    }

    console.log('👤 User id:', { userId })
    
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
    
    console.log('🔍 Attempting upsert with:', { userId, date: entryDate.toISOString() })
    
    const entry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: entryDate
        }
      },
      update: dataToSave,
      create: {
        userId: userId,
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
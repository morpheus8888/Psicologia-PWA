import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ 
      data: { 
        email, 
        password: hashed
      } 
    })
    return res.status(201).json({ success: true, user: { id: user.id, email: user.email, avatar: user.avatar, nickname: user.nickname } })
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  let secret: string
  try {
    secret = getJwtSecret()
  } catch (error) {
    return res.status(500).json({ error: 'JWT secret is not configured on the server' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '7d' })
  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      nickname: user.nickname,
      phone: user.phone ?? null,
      role: user.role,
      diaryVisibility: user.diaryVisibility,
      isAdmin: user.role === 'ADMIN',
    },
  })
}

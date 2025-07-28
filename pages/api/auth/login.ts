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

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  // TODO: replace with a real session mechanism
  res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; SameSite=Lax`)
  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      nickname: user.nickname,
      isAdmin: user.isAdmin
    }
  })
}

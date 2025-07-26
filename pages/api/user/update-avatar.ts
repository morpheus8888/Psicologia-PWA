import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { avatar } = req.body as { avatar?: string }
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }

  if (!avatar) {
    return res.status(400).json({ error: 'Missing avatar field' })
  }

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, secret) as { sub: string }
    const userId = payload.sub

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar, nickname: avatar },
      select: { id: true, email: true, avatar: true, nickname: true, phone: true, isAdmin: true }
    })

    return res.status(200).json({ success: true, user })
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    return res.status(400).json({ error: err.message })
  }
}
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).end('Unauthorized')

  try {
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, secret) as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } })
    if (!user) return res.status(404).end('Not found')
    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      description: user.description,
      avatar: user.avatar,
      color: user.color,
    })
  } catch {
    return res.status(401).end('Unauthorized')
  }
}

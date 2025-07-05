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

    if (req.method === 'GET') {
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
    } else if (req.method === 'PUT') {
      const { name, description, avatar } = req.body as {
        name?: string
        description?: string
        avatar?: string
      }
      const user = await prisma.user.update({
        where: { id: decoded.sub },
        data: { name, description, avatar },
      })
      return res.status(200).json({ success: true, user })
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).end('Method Not Allowed')
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

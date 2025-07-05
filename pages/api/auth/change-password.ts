import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const auth = req.headers.authorization
  if (!auth) return res.status(401).end('Unauthorized')

  try {
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, secret) as { sub: string }
    const { password } = req.body as { password?: string }
    if (!password) return res.status(400).json({ error: 'Missing password' })
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id: decoded.sub }, data: { password: hashed } })
    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
}

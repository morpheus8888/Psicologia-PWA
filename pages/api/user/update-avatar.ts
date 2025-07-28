import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { avatar } = req.body as { avatar?: string }
  const userId = req.cookies.userId

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (!avatar) {
    return res.status(400).json({ error: 'Missing avatar field' })
  }

  try {

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar, nickname: avatar },
      select: { id: true, email: true, avatar: true, nickname: true, phone: true, isAdmin: true }
    })

    return res.status(200).json({ success: true, user })
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
}
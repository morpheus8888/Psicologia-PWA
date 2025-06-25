import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  if (getUserByEmail(email)) {
    return res.status(400).json({ error: 'User exists' })
  }

  const hashed = bcrypt.hashSync(password, 10)
  const id = createUser(email, hashed, name)
  return res.status(201).json({ id })
}

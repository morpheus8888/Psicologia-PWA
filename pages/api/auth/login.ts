import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

function setTokenCookie(res: NextApiResponse, token: string) {
	const isProd = process.env.NODE_ENV === 'production'
	const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${
		isProd ? '; Secure' : ''
	}`
	res.setHeader('Set-Cookie', cookie)
}

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
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

	const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '7d' })
	setTokenCookie(res, token)
	return res.status(200).json({ success: true })
}

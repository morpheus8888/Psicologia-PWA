import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getToken } from '@/lib/getToken'

const secret = process.env.JWT_SECRET || 'secret'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST')
		return res.status(405).end('Method Not Allowed')
	}
	const token = getToken(req)
	if (!token) return res.status(401).json({ error: 'Unauthorized' })
	try {
		const payload = jwt.verify(token, secret) as { sub: string }
		const { oldPassword, newPassword } = req.body as {
			oldPassword?: string
			newPassword?: string
		}
		if (!oldPassword || !newPassword)
			return res.status(400).json({ error: 'Missing fields' })
		const user = await prisma.user.findUnique({ where: { id: payload.sub } })
		if (!user) return res.status(401).json({ error: 'Unauthorized' })
		const valid = await bcrypt.compare(oldPassword, user.password)
		if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
		const hashed = await bcrypt.hash(newPassword, 10)
		await prisma.user.update({
			where: { id: payload.sub },
			data: { password: hashed },
		})
		return res.status(200).json({ success: true })
	} catch (err: any) {
		return res.status(400).json({ error: err.message })
	}
}

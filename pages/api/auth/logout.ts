import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const cookie = 'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax'
	res.setHeader('Set-Cookie', cookie)
	return res.status(200).json({ success: true })
}

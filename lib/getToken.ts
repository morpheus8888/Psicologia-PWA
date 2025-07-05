import type { NextApiRequest } from 'next'

export function getToken(req: NextApiRequest): string | null {
	const cookie = req.headers.cookie
	if (!cookie) return null
	const parts = cookie.split(';').map((p) => p.trim())
	for (const part of parts) {
		if (part.startsWith('token=')) {
			return decodeURIComponent(part.substring('token='.length))
		}
	}
	return null
}

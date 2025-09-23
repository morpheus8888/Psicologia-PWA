import type { NextApiRequest, NextApiResponse } from 'next'
import sanitizeHtml from 'sanitize-html'
import jwt from 'jsonwebtoken'

import { prisma } from '@/lib/prisma'
import { getJwtSecret } from '@/lib/jwt'

const ensureAdmin = async (req: NextApiRequest) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new Error('UNAUTHORIZED')
  }
  const secret = getJwtSecret()
  const decoded = jwt.verify(token, secret) as { sub: string }
  const admin = await prisma.user.findUnique({ where: { id: decoded.sub } })
  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return admin
}

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Article ID required' })
  }

  try {
    if (req.method === 'GET') {
      await ensureAdmin(req)
      const article = await prisma.article.findUnique({
        where: { id },
        include: { author: { select: { email: true } } },
      })
      if (!article) {
        return res.status(404).json({ error: 'Article not found' })
      }
      return res.status(200).json({ article })
    }

    if (req.method === 'PUT') {
      const admin = await ensureAdmin(req)
      const { title, slug, summary, content, published } = req.body as {
        title?: string
        slug?: string
        summary?: string
        content?: string
        published?: boolean
      }

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const targetSlug = sanitizeSlug(slug || title)
      if (!targetSlug) {
        return res.status(400).json({ error: 'Invalid slug' })
      }

      const existing = await prisma.article.findUnique({ where: { slug: targetSlug } })
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'Slug already in use' })
      }

      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'blockquote']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt'],
        },
        allowedSchemes: ['data', 'http', 'https'],
      })

      const article = await prisma.article.update({
        where: { id },
        data: {
          title,
          slug: targetSlug,
          summary: summary?.trim() || null,
          content: sanitizedContent,
          authorId: admin.id,
          publishedAt: published ? new Date() : null,
        },
      })

      return res.status(200).json({ article })
    }

    if (req.method === 'DELETE') {
      await ensureAdmin(req)
      await prisma.article.delete({ where: { id } })
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Token mancante' })
    }
    if (error?.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Accesso negato' })
    }
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'JWT secret is not configured on the server' })
    }
    console.error('Error handling article request:', error)
    res.status(500).json({ error: 'Errore inatteso' })
  }
}

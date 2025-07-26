import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' }
    })

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin user already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        password: hashedPassword,
        isAdmin: true,
        nickname: 'Admin',
        avatar: 'leone'
      }
    })

    res.status(201).json({ 
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        isAdmin: admin.isAdmin
      }
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
    res.status(500).json({ error: 'Errore durante la creazione dell\'admin' })
  }
}
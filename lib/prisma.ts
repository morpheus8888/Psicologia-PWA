import type { PrismaClient } from '@prisma/client'

// use require so build succeeds even if the Prisma client isn't generated yet
const PrismaClientConstructor =
  (require('@prisma/client') as typeof import('@prisma/client')).PrismaClient

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientConstructor()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

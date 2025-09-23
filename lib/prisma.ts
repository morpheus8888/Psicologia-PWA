import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL)

const createUnavailableClient = () =>
  new Proxy(
    {},
    {
      get() {
        throw new Error('DATABASE_URL is not configured on the server')
      },
    }
  ) as PrismaClient

const prismaInstance = isDatabaseConfigured
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  : createUnavailableClient()

if (process.env.NODE_ENV !== 'production' && isDatabaseConfigured) {
  globalForPrisma.prisma = prismaInstance
}

export const prisma = prismaInstance

export default prisma

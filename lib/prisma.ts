// don't import types directly so builds succeed even if the Prisma client
// hasn't been generated yet
let PrismaClientConstructor: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClientConstructor = require('@prisma/client').PrismaClient
} catch {
  PrismaClientConstructor = class {}
}

const globalForPrisma = global as unknown as { prisma?: any }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientConstructor()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

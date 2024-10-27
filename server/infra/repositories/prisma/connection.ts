import Prisma from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const databaseUrl = Bun.env.DATABASE_URL_PRODUCTION
const isDev = Bun.env.IS_DEV as string

if (isDev === 'false' && !databaseUrl) {
  throw new Error('the database url is not defined')
}

export const prisma = new Prisma.PrismaClient({
  ...isDev === 'false'
    ? { datasourceUrl: 'file:' + (databaseUrl as string) }
    : {}
})

import {PrismaClient} from '@prisma/client'

export const dbCleaner = async (prisma: PrismaClient, tables: string[]) => {
  return Promise.all(
    tables.map((table) =>
      prisma.$queryRaw(`TRUNCATE TABLE "${table}" CASCADE;`)
    )
  )
}

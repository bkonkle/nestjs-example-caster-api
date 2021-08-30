import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common'
import {Prisma, PrismaClient} from '@prisma/client'

let client: PrismaClient | undefined

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  static init(options?: Prisma.PrismaClientOptions) {
    if (!client) {
      client = new PrismaService(options)
    }

    return client
  }

  static async disconnect() {
    if (client) {
      await client.$disconnect()
      client = undefined
    }
  }

  async onModuleInit() {
    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}

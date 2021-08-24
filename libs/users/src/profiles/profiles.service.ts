import {Injectable} from '@nestjs/common'

import {PrismaService} from '@caster/utils'

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    return this.prisma.profile.findFirst({
      include: {user: true},
      where: {id},
    })
  }
}

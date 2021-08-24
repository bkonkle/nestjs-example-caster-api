import {Injectable} from '@nestjs/common'

import {PrismaService} from '@caster/utils'

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}
}

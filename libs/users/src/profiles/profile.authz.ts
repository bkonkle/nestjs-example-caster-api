import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import {PrismaService} from '@caster/utils'

import {User} from '../users/user.model'
import {isOwner} from './profile.utils'

/**
 * TODO: Rip this out and use Guards instead.
 */
@Injectable()
export class ProfileAuthz {
  constructor(private readonly prisma: PrismaService) {}

  create = (username: string) => (user?: User | null) => {
    if (!user) {
      throw new BadRequestException('No user found with that id')
    }

    if (username !== user.username) {
      throw new ForbiddenException('Authorization required')
    }

    return user
  }

  update = async (username: string, id: string) => {
    const existing = await this.getExisting(id)

    if (isOwner(existing, username)) {
      return existing
    }

    throw new ForbiddenException('Authorization required')
  }

  delete = this.update

  private getExisting = async (id: string) => {
    const existing = await this.prisma.profile.findFirst({
      include: {user: true},
      where: {id},
    })

    if (!existing) {
      throw new NotFoundException('Not found')
    }

    return existing
  }
}

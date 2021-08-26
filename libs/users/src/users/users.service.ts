import {Injectable} from '@nestjs/common'

import {PrismaService} from '@caster/utils'

import {CreateUserInput, UpdateUserInput} from './user-input.model'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    return this.prisma.user.findFirst({
      include: {profile: true},
      where: {id},
    })
  }

  async getByUsername(username: string) {
    return this.prisma.user.findFirst({
      include: {profile: true},
      where: {username},
    })
  }

  async create(input: CreateUserInput) {
    return this.prisma.user.create({
      include: {profile: true},
      data: {
        ...input,
        profile: input.profile
          ? {
              create: input.profile,
            }
          : undefined,
      },
    })
  }

  async update(id: string, input: UpdateUserInput) {
    return this.prisma.user.update({
      include: {profile: true},
      where: {id},
      data: {
        username: input.username || undefined,
        isActive: input.isActive === null ? undefined : input.isActive,
      },
    })
  }
}

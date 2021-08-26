import {Injectable} from '@nestjs/common'
import {Prisma} from '@prisma/client'

import {getOffset, PrismaService} from '@caster/utils'

import {CreateProfileInput, UpdateProfileInput} from './profile-input.model'
import {fromProfileInput} from './profile.utils'

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    return this.prisma.profile.findFirst({
      include: {user: true},
      where: {id},
    })
  }

  async getMany(options: {
    where: Prisma.ProfileWhereInput | undefined
    orderBy: Prisma.ProfileOrderByInput | undefined
    pageSize?: number
    page?: number
  }) {
    const {pageSize, page, ...rest} = options

    const total = await this.prisma.profile.count(rest)
    const profiles = await this.prisma.profile.findMany({
      include: {user: true},
      ...rest,
      ...getOffset(pageSize, page),
    })

    return {total, profiles}
  }

  async create(userId: string, input: CreateProfileInput) {
    return this.prisma.profile.create({
      include: {user: true},
      data: {
        ...input,
        userId: undefined,
        user: {
          connect: {id: userId},
        },
      },
    })
  }

  async update(id: string, input: UpdateProfileInput) {
    const data = input.userId
      ? {
          ...input,
          userId: undefined,
          user: {
            connect: {id: input.userId},
          },
        }
      : input

    return this.prisma.profile.update({
      include: {user: true},
      where: {id},
      data: fromProfileInput(data),
    })
  }

  async delete(id: string) {
    return this.prisma.profile.delete({
      include: {user: true},
      where: {id},
    })
  }
}
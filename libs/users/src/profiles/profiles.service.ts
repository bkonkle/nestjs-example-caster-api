import {Injectable} from '@nestjs/common'
import {Prisma} from '@prisma/client'
import {PrismaService} from 'nestjs-prisma'

import {getOffset, paginateResponse} from '@caster/utils/pagination'
import {toUndefinedProps} from '@caster/utils/types'

import {CreateProfileInput, UpdateProfileInput} from './profile-mutations.model'
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
    orderBy: Prisma.ProfileOrderByWithRelationInput | undefined
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

    return paginateResponse(profiles, {
      total,
      pageSize,
      page,
    })
  }

  async create(input: CreateProfileInput) {
    return this.prisma.profile.create({
      include: {user: true},
      data: {
        ...toUndefinedProps(input),
        userId: undefined,
        user: {
          connect: {id: input.userId},
        },
      },
    })
  }

  async update(id: string, input: UpdateProfileInput) {
    const data = input.userId
      ? {
          ...input,
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

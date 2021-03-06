import {Injectable} from '@nestjs/common'
import {Prisma, Show} from '@prisma/client'
import {PrismaService} from 'nestjs-prisma'

import {
  getOffset,
  ManyResponse,
  paginateResponse,
} from '@caster/utils/pagination'
import {fixJsonInput, toUndefinedProps} from '@caster/utils/types'

import {CreateShowInput, UpdateShowInput} from './show-mutations.model'

@Injectable()
export class ShowsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string): Promise<Show | null> {
    return this.prisma.show.findFirst({
      where: {id},
    })
  }

  async getMany(options: {
    where: Prisma.ShowWhereInput | undefined
    orderBy: Prisma.ShowOrderByWithRelationInput | undefined
    pageSize?: number
    page?: number
  }): Promise<ManyResponse<Show>> {
    const {pageSize, page, ...rest} = options

    const total = await this.prisma.show.count(rest)
    const profiles = await this.prisma.show.findMany({
      ...rest,
      ...getOffset(pageSize, page),
    })

    return paginateResponse(profiles, {
      total,
      pageSize,
      page,
    })
  }

  async create(input: CreateShowInput): Promise<Show> {
    return this.prisma.show.create({
      data: toUndefinedProps(input),
    })
  }

  async update(id: string, input: UpdateShowInput): Promise<Show> {
    return this.prisma.show.update({
      where: {id},
      data: fixJsonInput(input),
    })
  }

  async delete(id: string): Promise<Show> {
    return this.prisma.show.delete({
      where: {id},
    })
  }
}

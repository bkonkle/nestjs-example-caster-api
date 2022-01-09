import {Injectable} from '@nestjs/common'
import {Prisma, Episode} from '@prisma/client'
import {PrismaService} from 'nestjs-prisma'

import {
  getOffset,
  ManyResponse,
  paginateResponse,
} from '@caster/utils/pagination'
import {fixJsonInput, toUndefinedProps} from '@caster/utils/types'

import {CreateEpisodeInput, UpdateEpisodeInput} from './episode-mutations.model'

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string): Promise<Episode | null> {
    return this.prisma.episode.findFirst({
      where: {id},
    })
  }

  async getMany(options: {
    where: Prisma.EpisodeWhereInput | undefined
    orderBy: Prisma.EpisodeOrderByWithRelationInput | undefined
    pageSize?: number
    page?: number
  }): Promise<ManyResponse<Episode>> {
    const {pageSize, page, ...rest} = options

    const total = await this.prisma.episode.count(rest)
    const profiles = await this.prisma.episode.findMany({
      ...rest,
      ...getOffset(pageSize, page),
    })

    return paginateResponse(profiles, {
      total,
      pageSize,
      page,
    })
  }

  async create(input: CreateEpisodeInput): Promise<Episode> {
    return this.prisma.episode.create({
      data: toUndefinedProps(input),
    })
  }

  async update(id: string, input: UpdateEpisodeInput): Promise<Episode> {
    return this.prisma.episode.update({
      where: {id},
      data: fixJsonInput(input),
    })
  }

  async delete(id: string): Promise<Episode> {
    return this.prisma.episode.delete({
      where: {id},
    })
  }
}

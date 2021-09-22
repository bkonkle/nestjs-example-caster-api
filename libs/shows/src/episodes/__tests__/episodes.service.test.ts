import {Test} from '@nestjs/testing'
import {Episode as PrismaEpisode} from '@prisma/client'
import {mockDeep} from 'jest-mock-extended'
import {PrismaService} from 'nestjs-prisma'

import {ShowFactory} from '../../../test/factories/show.factory'
import {EpisodeFactory} from '../../../test/factories/episodes.factory'
import {
  CreateEpisodeInput,
  UpdateEpisodeInput,
} from '../episode-mutations.model'
import {EpisodesService} from '../episodes.service'

describe('EpisodesService', () => {
  let service: EpisodesService

  const prisma = mockDeep<PrismaService>()

  const show = ShowFactory.make()
  const episode = EpisodeFactory.make({showId: show.id, show})

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: PrismaService, useValue: prisma}, EpisodesService],
    }).compile()

    service = testModule.get(EpisodesService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get()', () => {
    it('uses Prisma to find the first matching Episode by id', async () => {
      prisma.episode.findFirst.mockResolvedValueOnce(episode as PrismaEpisode)

      const result = await service.get(episode.id)

      expect(prisma.episode.findFirst).toBeCalledTimes(1)
      expect(prisma.episode.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {id: episode.id},
        })
      )

      expect(result).toEqual(episode)
    })
  })

  describe('getMany()', () => {
    it('uses Prisma to find many Episodes', async () => {
      prisma.episode.count.mockResolvedValueOnce(1)
      prisma.episode.findMany.mockResolvedValueOnce([episode as PrismaEpisode])

      const expected = {
        data: [episode],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      const result = await service.getMany({
        where: {title: episode.title},
        orderBy: {
          id: 'asc',
        },
      })

      expect(prisma.episode.findMany).toBeCalledTimes(1)
      expect(prisma.episode.findMany).toBeCalledWith(
        expect.objectContaining({
          where: {title: episode.title},
          orderBy: {
            id: 'asc',
          },
        })
      )

      expect(result).toEqual(expected)
    })
  })

  describe('create()', () => {
    it('uses Prisma to create a new Episode', async () => {
      prisma.episode.create.mockResolvedValueOnce(episode as PrismaEpisode)

      const input: CreateEpisodeInput = {title: episode.title, showId: show.id}

      const result = await service.create(input)

      expect(prisma.episode.create).toBeCalledTimes(1)
      expect(prisma.episode.create).toBeCalledWith(
        expect.objectContaining({
          data: input,
        })
      )

      expect(result).toEqual(episode)
    })
  })

  describe('update()', () => {
    it('uses Prisma to update an existing Episode', async () => {
      prisma.episode.update.mockResolvedValueOnce(episode as PrismaEpisode)

      const input: UpdateEpisodeInput = {title: 'Test Title'}

      const result = await service.update(episode.id, input)

      expect(prisma.episode.update).toBeCalledTimes(1)
      expect(prisma.episode.update).toBeCalledWith(
        expect.objectContaining({
          where: {id: episode.id},
          data: input,
        })
      )

      expect(result).toEqual(episode)
    })
  })

  describe('delete()', () => {
    it('uses Prisma to delete an existing Episode', async () => {
      prisma.episode.delete.mockResolvedValueOnce(episode as PrismaEpisode)

      const result = await service.delete(episode.id)

      expect(prisma.episode.delete).toBeCalledTimes(1)
      expect(prisma.episode.delete).toBeCalledWith(
        expect.objectContaining({
          where: {id: episode.id},
        })
      )

      expect(result).toEqual(episode)
    })
  })
})

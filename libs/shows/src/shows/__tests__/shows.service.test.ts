import {Test} from '@nestjs/testing'
import {Show as PrismaShow} from '@prisma/client'
import {mockDeep} from 'jest-mock-extended'
import {PrismaService} from 'nestjs-prisma'

import {ShowFactory} from '../../../test/factories/show.factory'
import {CreateShowInput, UpdateShowInput} from '../show-mutations.model'
import {ShowsService} from '../shows.service'

describe('ShowsService', () => {
  let service: ShowsService

  const prisma = mockDeep<PrismaService>()

  const show = ShowFactory.make()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: PrismaService, useValue: prisma}, ShowsService],
    }).compile()

    service = testModule.get(ShowsService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get()', () => {
    it('uses Prisma to find the first matching Show by id', async () => {
      prisma.show.findFirst.mockResolvedValueOnce(show as PrismaShow)

      const result = await service.get(show.id)

      expect(prisma.show.findFirst).toBeCalledTimes(1)
      expect(prisma.show.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {id: show.id},
        })
      )

      expect(result).toEqual(show)
    })
  })

  describe('getMany()', () => {
    it('uses Prisma to find many Shows', async () => {
      prisma.show.count.mockResolvedValueOnce(1)
      prisma.show.findMany.mockResolvedValueOnce([show as PrismaShow])

      const expected = {
        data: [show],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      const result = await service.getMany({
        where: {title: show.title},
        orderBy: {
          id: 'asc',
        },
      })

      expect(prisma.show.findMany).toBeCalledTimes(1)
      expect(prisma.show.findMany).toBeCalledWith(
        expect.objectContaining({
          where: {title: show.title},
          orderBy: {
            id: 'asc',
          },
        })
      )

      expect(result).toEqual(expected)
    })
  })

  describe('create()', () => {
    it('uses Prisma to create a new Show', async () => {
      prisma.show.create.mockResolvedValueOnce(show as PrismaShow)

      const input: CreateShowInput = {title: show.title}

      const result = await service.create(input)

      expect(prisma.show.create).toBeCalledTimes(1)
      expect(prisma.show.create).toBeCalledWith(
        expect.objectContaining({
          data: input,
        })
      )

      expect(result).toEqual(show)
    })
  })

  describe('update()', () => {
    it('uses Prisma to update an existing Show', async () => {
      prisma.show.update.mockResolvedValueOnce(show as PrismaShow)

      const input: UpdateShowInput = {title: 'Test Title'}

      const result = await service.update(show.id, input)

      expect(prisma.show.update).toBeCalledTimes(1)
      expect(prisma.show.update).toBeCalledWith(
        expect.objectContaining({
          where: {id: show.id},
          data: input,
        })
      )

      expect(result).toEqual(show)
    })
  })

  describe('delete()', () => {
    it('uses Prisma to delete an existing Show', async () => {
      prisma.show.delete.mockResolvedValueOnce(show as PrismaShow)

      const result = await service.delete(show.id)

      expect(prisma.show.delete).toBeCalledTimes(1)
      expect(prisma.show.delete).toBeCalledWith(
        expect.objectContaining({
          where: {id: show.id},
        })
      )

      expect(result).toEqual(show)
    })
  })
})

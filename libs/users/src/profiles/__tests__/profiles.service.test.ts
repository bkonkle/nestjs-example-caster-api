import {Test} from '@nestjs/testing'
import {Profile as PrismaProfile} from '@prisma/client'
import {mockDeep} from 'jest-mock-extended'
import {PrismaService} from 'nestjs-prisma'

import {UserFactory} from '../../../test/factories/user.factory'
import {ProfileFactory} from '../../../test/factories/profile.factory'
import {
  CreateProfileInput,
  UpdateProfileInput,
} from '../profile-mutations.model'
import {ProfilesService} from '../profiles.service'

describe('ProfilesService', () => {
  let service: ProfilesService

  const prisma = mockDeep<PrismaService>()

  const username = 'test-username'
  const email = 'test@email.com'
  const user = UserFactory.make({username})
  const profile = ProfileFactory.make({user, userId: user.id, email})

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: PrismaService, useValue: prisma}, ProfilesService],
    }).compile()

    service = testModule.get(ProfilesService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get()', () => {
    it('uses Prisma to find the first matching Profile by id', async () => {
      prisma.profile.findFirst.mockResolvedValueOnce(profile as PrismaProfile)

      const result = await service.get(profile.id)

      expect(prisma.profile.findFirst).toBeCalledTimes(1)
      expect(prisma.profile.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {id: profile.id},
        })
      )

      expect(result).toEqual(profile)
    })
  })

  describe('getMany()', () => {
    it('uses Prisma to find many Profiles', async () => {
      prisma.profile.count.mockResolvedValueOnce(1)
      prisma.profile.findMany.mockResolvedValueOnce([profile as PrismaProfile])

      const expected = {
        data: [profile],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      const result = await service.getMany({
        where: {email},
        orderBy: {
          id: 'asc',
        },
      })

      expect(prisma.profile.findMany).toBeCalledTimes(1)
      expect(prisma.profile.findMany).toBeCalledWith(
        expect.objectContaining({
          where: {email},
          orderBy: {
            id: 'asc',
          },
        })
      )

      expect(result).toEqual(expected)
    })
  })

  describe('create()', () => {
    it('uses Prisma to create a new Profile', async () => {
      prisma.profile.create.mockResolvedValueOnce(profile as PrismaProfile)

      const input: CreateProfileInput = {email, userId: user.id}

      const result = await service.create(input)

      expect(prisma.profile.create).toBeCalledTimes(1)
      expect(prisma.profile.create).toBeCalledWith(
        expect.objectContaining({
          data: {
            ...input,
            userId: undefined,
            user: {
              connect: {id: user.id},
            },
          },
        })
      )

      expect(result).toEqual(profile)
    })
  })

  describe('update()', () => {
    it('uses Prisma to update an existing Profile', async () => {
      prisma.profile.update.mockResolvedValueOnce(profile as PrismaProfile)

      const input: UpdateProfileInput = {displayName: 'Test Display Name'}

      const result = await service.update(profile.id, input)

      expect(prisma.profile.update).toBeCalledTimes(1)
      expect(prisma.profile.update).toBeCalledWith(
        expect.objectContaining({
          where: {id: profile.id},
          data: input,
        })
      )

      expect(result).toEqual(profile)
    })
  })

  describe('delete()', () => {
    it('uses Prisma to delete an existing Profile', async () => {
      prisma.profile.delete.mockResolvedValueOnce(profile as PrismaProfile)

      const result = await service.delete(profile.id)

      expect(prisma.profile.delete).toBeCalledTimes(1)
      expect(prisma.profile.delete).toBeCalledWith(
        expect.objectContaining({
          where: {id: profile.id},
        })
      )

      expect(result).toEqual(profile)
    })
  })
})

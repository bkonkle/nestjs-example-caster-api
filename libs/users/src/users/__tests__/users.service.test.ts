import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'
import {PrismaService} from 'nestjs-prisma'

import * as UserFactory from '../../../test/factories/user.factory'
import {CreateUserInput, UpdateUserInput} from '../user-input.model'
import {UsersService} from '../users.service'

describe('UsersService', () => {
  let service: UsersService

  const prisma = mockDeep<PrismaService>()

  const username = 'test-username'
  const user = UserFactory.make({username})

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: PrismaService, useValue: prisma}, UsersService],
    }).compile()

    service = testModule.get(UsersService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get()', () => {
    it('uses Prisma to find the first matching User by id', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(user)

      const result = await service.get(user.id)

      expect(prisma.user.findFirst).toBeCalledTimes(1)
      expect(prisma.user.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {id: user.id},
        })
      )

      expect(result).toEqual(user)
    })
  })

  describe('getByUsername()', () => {
    it('uses Prisma to find the first matching User by username', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(user)

      const result = await service.getByUsername(username)

      expect(prisma.user.findFirst).toBeCalledTimes(1)
      expect(prisma.user.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {username},
        })
      )

      expect(result).toEqual(user)
    })
  })

  describe('create()', () => {
    it('uses Prisma to create a new User', async () => {
      prisma.user.create.mockResolvedValueOnce(user)

      const input: CreateUserInput = {username}

      const result = await service.create(input)

      expect(prisma.user.create).toBeCalledTimes(1)
      expect(prisma.user.create).toBeCalledWith(
        expect.objectContaining({
          data: input,
        })
      )

      expect(result).toEqual(user)
    })

    it('creates the Profile inline if input is provided', async () => {
      prisma.user.create.mockResolvedValueOnce(user)

      const input: CreateUserInput = {
        username,
        profile: {email: 'test@email.com'},
      }

      await service.create(input)

      expect(prisma.user.create).toBeCalledTimes(1)
      expect(prisma.user.create).toBeCalledWith(
        expect.objectContaining({
          data: {
            ...input,
            profile: {create: input.profile},
          },
        })
      )
    })
  })

  describe('update()', () => {
    it('uses Prisma to update an existing User', async () => {
      prisma.user.update.mockResolvedValueOnce(user)

      const input: UpdateUserInput = {isActive: false}

      const result = await service.update(user.id, input)

      expect(prisma.user.update).toBeCalledTimes(1)
      expect(prisma.user.update).toBeCalledWith(
        expect.objectContaining({
          where: {id: user.id},
          data: input,
        })
      )

      expect(result).toEqual(user)
    })
  })
})

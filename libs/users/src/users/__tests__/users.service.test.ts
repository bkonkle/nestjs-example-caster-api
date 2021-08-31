import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'
import {PrismaService} from 'nestjs-prisma'

import {UserFactory} from '../../../test/factories'
import {UsersService} from '../users.service'

describe('UsersService', () => {
  let service: UsersService

  const prisma = mockDeep<PrismaService>()

  const username = 'test-username'

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: PrismaService, useValue: prisma}, UsersService],
    }).compile()

    service = testModule.get(UsersService)
  })

  describe('getByUsername()', () => {
    const user = UserFactory.make()

    it('uses Prisma to find the first matching User by username', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(user)

      const result = await service.getByUsername(username)

      expect(prisma.user.findFirst).toBeCalledTimes(1)
      expect(prisma.user.findFirst).toBeCalledWith({
        include: {profile: true},
        where: {username},
      })

      expect(result).toEqual(user)
    })
  })
})

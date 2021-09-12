import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

import {UserFactory} from '../../../test/factories'
import {UsersResolver} from '../users.resolver'
import {UsersService} from '../users.service'
import {UserWithProfile} from '../user.types'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  const service = mockDeep<UsersService>()

  const username = 'test-username'
  const user = UserFactory.make({username}) as UserWithProfile

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: UsersService, useValue: service}, UsersResolver],
    }).compile()

    resolver = testModule.get(UsersResolver)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCurrentUser()', () => {
    it('uses the UsersService to find the User by username', async () => {
      service.getByUsername.mockResolvedValueOnce(user)

      const result = await resolver.getCurrentUser(username)

      expect(service.getByUsername).toBeCalledTimes(1)
      expect(service.getByUsername).toBeCalledWith(username)

      expect(result).toEqual(user)
    })
  })

  describe('getOrCreateCurrentUser()', () => {
    it('uses the UsersService to get a User if one is found for the given username', async () => {
      const input = {username}

      service.getByUsername.mockResolvedValueOnce(user)

      const result = await resolver.getOrCreateCurrentUser(input, username)

      expect(service.getByUsername).toBeCalledTimes(1)
      expect(service.getByUsername).toBeCalledWith(username)

      expect(service.create).not.toBeCalled()

      expect(result).toEqual({user})
    })

    it('uses the UsersService to create a User if none is found for the given username', async () => {
      const input = {username}

      service.create.mockResolvedValueOnce(user)

      await resolver.getOrCreateCurrentUser(input, username)

      expect(service.getByUsername).toBeCalledTimes(1)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)
    })
  })

  describe('updateCurrentUser()', () => {
    it('uses the UsersService to update an existing User', async () => {
      const input = {isActive: false}

      service.getByUsername.mockResolvedValueOnce(user)
      service.update.mockResolvedValueOnce(user)

      const result = await resolver.updateCurrentUser(input, username)

      expect(service.getByUsername).toBeCalledTimes(1)
      expect(service.getByUsername).toBeCalledWith(username)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(user.id, input)

      expect(result).toEqual({user})
    })
  })
})

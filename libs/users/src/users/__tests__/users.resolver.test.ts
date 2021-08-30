import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

import {UserFactory} from '../../../test/factories'
import {UsersResolver} from '../users.resolver'
import {UsersService} from '../users.service'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  const service = mockDeep<UsersService>()

  const username = 'test-username'

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: UsersService, useValue: service}, UsersResolver],
    }).compile()

    resolver = testModule.get(UsersResolver)
  })

  describe('getCurrentUser()', () => {
    const user = UserFactory.make()

    it('uses then UserService to find the User by username', async () => {
      service.getByUsername.mockResolvedValueOnce(user)

      const result = await resolver.getCurrentUser(username)

      expect(service.getByUsername).toBeCalledTimes(1)
      expect(service.getByUsername).toBeCalledWith(username)

      expect(result).toEqual(user)
    })
  })
})

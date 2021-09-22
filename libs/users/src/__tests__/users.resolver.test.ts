import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {AbilityFactory} from '@caster/authz/ability.factory'
import {AppAbility} from '@caster/authz/authz.types'
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

import {UserFactory} from '../../test/factories/user.factory'
import {UsersResolver} from '../users.resolver'
import {UsersService} from '../users.service'
import {UserWithProfile} from '../user.types'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  const service = mockDeep<UsersService>()
  const abilityFactory = mockDeep<AbilityFactory>()
  const ability = mockDeep<AppAbility>()

  // Default to "true"
  ability.can.mockReturnValue(true)

  const username = 'test-username'
  const user = UserFactory.make({username}) as UserWithProfile

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        {provide: UsersService, useValue: service},
        {provide: AbilityFactory, useValue: abilityFactory},
        UsersResolver,
      ],
    }).compile()

    resolver = testModule.get(UsersResolver)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCurrentUser()', () => {
    it('uses the RequestUser decorator to find the User by username', async () => {
      const result = await resolver.getCurrentUser(username, user)

      expect(result).toEqual(user)
    })
  })

  describe('getOrCreateCurrentUser()', () => {
    it('uses the RequestUsers decorator to get a User if one is found for the given username', async () => {
      const input = {username}

      const result = await resolver.getOrCreateCurrentUser(
        input,
        username,
        user
      )

      expect(service.create).not.toBeCalled()

      expect(result).toEqual({user})
    })

    it('uses the UsersService to create a User if none is found for the given username', async () => {
      const input = {username}

      service.create.mockResolvedValueOnce(user)

      await resolver.getOrCreateCurrentUser(input, username)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)
    })
  })

  describe('updateCurrentUser()', () => {
    it('uses the UsersService to update an existing User', async () => {
      const input = {isActive: false}

      service.update.mockResolvedValueOnce(user)

      const result = await resolver.updateCurrentUser(input, user)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(user.id, input)

      expect(result).toEqual({user})
    })
  })
})

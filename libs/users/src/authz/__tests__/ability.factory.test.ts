import faker from 'faker'
import {Test} from '@nestjs/testing'
import {subject} from '@casl/ability'
import {mockDeep} from 'jest-mock-extended'

import {ProfileFactory} from '../../../test/factories/profile.factory'
import {UserFactory} from '../../../test/factories/user.factory'
import {UserWithProfile} from '../../user.types'
import {AbilityFactory} from '../ability.factory'
import {Action, RuleEnhancer, Rules} from '../authz.types'

describe('AbilityFactory', () => {
  let factory: AbilityFactory

  const profile = ProfileFactory.make()
  const user = UserFactory.make({profile}) as UserWithProfile

  const enhancer = mockDeep<RuleEnhancer>()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [AbilityFactory, {provide: Rules, useValue: [enhancer]}],
    }).compile()

    factory = testModule.get(AbilityFactory)
  })

  describe('createForUser()', () => {
    it('iterates over the registered enhancers', async () => {
      enhancer.forUser.mockImplementationOnce(async (_, {can}) => {
        can(Action.Manage, 'User', {id: user.id})
      })

      const ability = await factory.createForUser(user)

      expect(enhancer.forUser).toBeCalledTimes(1)
      expect(enhancer.forUser).toBeCalledWith(
        user,
        expect.objectContaining({
          can: expect.any(Function),
          cannot: expect.any(Function),
        })
      )

      // Ensure that the ability is initialized correctly
      expect(ability.can(Action.Manage, subject('User', user))).toBe(true)
      expect(ability.cannot(Action.Manage, subject('User', user))).toBe(false)

      expect(
        ability.can(
          Action.Manage,
          subject('User', {...user, id: faker.datatype.uuid()})
        )
      ).toBe(false)

      expect(
        ability.cannot(
          Action.Manage,
          subject('User', {...user, id: faker.datatype.uuid()})
        )
      ).toBe(true)
    })
  })
})

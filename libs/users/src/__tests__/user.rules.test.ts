import {Test} from '@nestjs/testing'
import {AbilityBuilder, subject} from '@casl/ability'

import {Action, AppAbility} from '@caster/authz/authz.types'

import {ProfileFactory} from '../../test/factories/profile.factory'
import {UserFactory} from '../../test/factories/user.factory'
import {UserRules} from '../user.rules'
import {UserWithProfile} from '../user.types'

describe('UserRules', () => {
  let rules: UserRules

  const profile = ProfileFactory.make()
  const user = UserFactory.make({profile}) as UserWithProfile

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [UserRules],
    }).compile()

    rules = testModule.get(UserRules)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('forUser()', () => {
    it('adds rules for authenticated users', async () => {
      const builder = new AbilityBuilder(AppAbility)

      await rules.forUser(user, builder)

      const ability = builder.build()

      expect(ability.can(Action.Create, subject('User', user))).toBe(true)

      expect(
        ability.can(
          Action.Create,
          subject('User', {...user, username: 'other-username'})
        )
      ).toBe(false)

      expect(ability.can(Action.Read, subject('User', user))).toBe(true)

      expect(
        ability.can(
          Action.Read,
          subject('User', {...user, username: 'other-username'})
        )
      ).toBe(false)

      expect(ability.can(Action.Update, subject('User', user))).toBe(true)

      expect(
        ability.can(
          Action.Update,
          subject('User', {...user, username: 'other-username'})
        )
      ).toBe(false)
    })

    it("doesn't add rules for anonymous users", async () => {
      const builder = new AbilityBuilder(AppAbility)

      await rules.forUser(undefined, builder)

      const ability = builder.build()

      expect(ability.can(Action.Create, subject('User', user))).toBe(false)
      expect(ability.can(Action.Read, subject('User', user))).toBe(false)
      expect(ability.can(Action.Update, subject('User', user))).toBe(false)
    })
  })
})

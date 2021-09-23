import {mockDeep} from 'jest-mock-extended'
import {Test} from '@nestjs/testing'

import {Action, RuleBuilder} from '@caster/users/authz/authz.types'
import {RolesService} from '@caster/roles/roles.service'

import {EpisodeRules} from '../episode.rules'

describe('EpisodeRules', () => {
  let rules: EpisodeRules

  const roles = mockDeep<RolesService>()

  const builder = mockDeep<RuleBuilder>()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: RolesService, useValue: roles}, EpisodeRules],
    }).compile()

    rules = testModule.get(EpisodeRules)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('forUser()', () => {
    it('allows everyone to read', async () => {
      await rules.forUser(undefined, builder)

      expect(roles.getPermissionsForTable).not.toBeCalled()

      expect(builder.can).toBeCalledTimes(1)
      expect(builder.can).toBeCalledWith(Action.Read, 'Episode')
    })
  })
})

import {mockDeep} from 'jest-mock-extended'
import {Test} from '@nestjs/testing'

import {Action, RuleBuilder} from '@caster/authz'
import {RolesService} from '@caster/roles'

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

  afterEach(() => {
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

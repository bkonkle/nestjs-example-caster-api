import {mockDeep} from 'jest-mock-extended'
import {Test} from '@nestjs/testing'

import {Action, RuleBuilder} from '@caster/authz'
import {RolesService} from '@caster/roles'
import {UserWithProfile} from '@caster/users'
import {ProfileFactory, UserFactory} from '@caster/users/test'

import {Update, Delete, ManageEpisodes, ManageRoles} from '../show.roles'
import {ShowRules} from '../show.rules'

describe('ShowRules', () => {
  let rules: ShowRules

  const roles = mockDeep<RolesService>()

  const profile = ProfileFactory.make()
  const user = UserFactory.make({
    profileId: profile.id,
    profile,
  }) as UserWithProfile

  const builder = mockDeep<RuleBuilder>()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: RolesService, useValue: roles}, ShowRules],
    }).compile()

    rules = testModule.get(ShowRules)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('forUser()', () => {
    it('allows everyone to read', async () => {
      await rules.forUser(undefined, builder)

      expect(roles.getPermissionsForTable).not.toBeCalled()

      expect(builder.can).toBeCalledTimes(1)
      expect(builder.can).toBeCalledWith(Action.Read, 'Show')
    })

    it('allows authenticated users to create', async () => {
      roles.getPermissionsForTable.mockResolvedValueOnce({})

      await rules.forUser(user, builder)

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)
      expect(roles.getPermissionsForTable).toBeCalledWith(profile.id, 'Show')

      expect(builder.can).toBeCalledTimes(2)
      expect(builder.can).toBeCalledWith(Action.Create, 'Show')
    })

    it('supports the Admin role', async () => {
      const showId = 'test-show-id'

      roles.getPermissionsForTable.mockResolvedValueOnce({
        [showId]: [Update, Delete, ManageEpisodes, ManageRoles],
      })

      await rules.forUser(user, builder)

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)

      expect(builder.can).toBeCalledTimes(6)
      expect(builder.can).toBeCalledWith(Action.Update, 'Show', {id: showId})
      expect(builder.can).toBeCalledWith(Action.Delete, 'Show', {id: showId})
      expect(builder.can).toBeCalledWith(Action.Manage, 'Episode', {
        showId: showId,
      })
      expect(builder.can).toBeCalledWith(Action.Manage, 'RoleGrant', {
        subjectTable: 'Show',
        subjectId: showId,
      })
    })

    it('allows users with a profile to manage episodes they are authorized to', async () => {
      const showId = 'test-show-id'

      roles.getPermissionsForTable.mockResolvedValueOnce({
        [showId]: [Update, ManageEpisodes],
      })

      await rules.forUser(user, builder)

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)

      expect(builder.can).toBeCalledTimes(4)
      expect(builder.can).toBeCalledWith(Action.Update, 'Show', {id: showId})
      expect(builder.can).toBeCalledWith(Action.Manage, 'Episode', {
        showId: showId,
      })
    })
  })
})

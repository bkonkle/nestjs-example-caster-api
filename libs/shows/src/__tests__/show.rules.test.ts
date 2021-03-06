import {mockDeep} from 'jest-mock-extended'
import {Test} from '@nestjs/testing'
import {AbilityBuilder, subject} from '@casl/ability'
import {Episode, Show} from '@prisma/client'

import {Action, AppAbility} from '@caster/authz/authz.types'
import {RolesService} from '@caster/roles/roles.service'
import {UserWithProfile} from '@caster/users/user.types'
import {UserFactory} from '@caster/users/test/factories/user.factory'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'
import {RoleGrantFactory} from '@caster/roles/test/factories/role-grant.factory'

import {ShowFactory} from '../../test/factories/show.factory'
import {EpisodeFactory} from '../../test/factories/episodes.factory'
import {Update, Delete, ManageEpisodes, ManageRoles} from '../show.roles'
import {ShowRules} from '../show.rules'

describe('ShowRules', () => {
  let rules: ShowRules

  const builder = new AbilityBuilder(AppAbility)
  const roles = mockDeep<RolesService>()

  const profile = ProfileFactory.make()
  const user = UserFactory.make({
    profileId: profile.id,
    profile,
  }) as UserWithProfile

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [{provide: RolesService, useValue: roles}, ShowRules],
    }).compile()

    rules = testModule.get(ShowRules)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('forUser()', () => {
    it('allows everyone to read', async () => {
      await rules.forUser(undefined, builder)

      expect(roles.getPermissionsForTable).not.toBeCalled()

      const ability = builder.build()

      expect(ability.can(Action.Read, 'Show')).toBe(true)
    })

    it('allows authenticated users to create', async () => {
      roles.getPermissionsForTable.mockResolvedValueOnce({})

      await rules.forUser(user, builder)

      const ability = builder.build()

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)
      expect(roles.getPermissionsForTable).toBeCalledWith(profile.id, 'Show')

      expect(ability.can(Action.Create, 'Show')).toBe(true)
    })

    it('supports the Admin role', async () => {
      const showId = 'test-show-id'
      const show = ShowFactory.make({id: showId}) as Show
      const episode = EpisodeFactory.make({showId}) as Episode

      roles.getPermissionsForTable.mockResolvedValueOnce({
        [showId]: [Update, Delete, ManageEpisodes, ManageRoles],
      })

      await rules.forUser(user, builder)

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)

      const ability = builder.build()

      expect(ability.can(Action.Update, subject('Show', show)))
      expect(ability.can(Action.Delete, subject('Show', show)))
      expect(ability.can(Action.Manage, subject('Episode', episode)))
      expect(
        ability.can(
          Action.Manage,
          subject(
            'RoleGrant',
            RoleGrantFactory.make({subjectTable: 'Show', subjectId: showId})
          )
        )
      )
    })

    it('allows users with a profile to manage episodes they are authorized to', async () => {
      const showId = 'test-show-id'
      const show = ShowFactory.make({id: showId}) as Show
      const episode = EpisodeFactory.make({showId}) as Episode

      roles.getPermissionsForTable.mockResolvedValueOnce({
        [showId]: [Update, ManageEpisodes],
      })

      await rules.forUser(user, builder)

      expect(roles.getPermissionsForTable).toBeCalledTimes(1)

      const ability = builder.build()

      expect(ability.can(Action.Update, subject('Show', show)))
      expect(ability.can(Action.Update, subject('Episode', episode)))
    })
  })
})

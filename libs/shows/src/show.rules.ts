import {Injectable} from '@nestjs/common'

import {Action, RuleBuilder, RuleEnhancer} from '@caster/authz/authz.types'
import {RolesService} from '@caster/roles/roles.service'
import {UserWithProfile} from '@caster/users/user.types'

import {Update, Delete, ManageEpisodes, ManageRoles} from './show.roles'

@Injectable()
export class ShowRules implements RuleEnhancer {
  constructor(private readonly roles: RolesService) {}

  async forUser(
    user: UserWithProfile | undefined,
    {can}: RuleBuilder
  ): Promise<void> {
    // Anonymous
    can(Action.Read, 'Show')

    if (!user) {
      return
    }

    // Authenticated
    can(Action.Create, 'Show')

    const profileId = user.profile?.id
    if (!profileId) {
      return
    }

    // Pull all the Permissions for this Profile in the Show table
    const showPermissions = await this.roles.getPermissionsForTable(
      profileId,
      'Show'
    )

    // Iterate over the showIds returned and build rules for each Show
    Object.keys(showPermissions).forEach((showId) => {
      showPermissions[showId].forEach((permission) => {
        switch (permission.key) {
          case Update.key:
            return can(Action.Update, 'Show', {id: showId})
          case Delete.key:
            return can(Action.Delete, 'Show', {id: showId})
          case ManageEpisodes.key:
            return can(Action.Manage, 'Episode', {showId})
          case ManageRoles.key:
            return can(Action.Manage, 'RoleGrant', {
              subjectTable: 'Show',
              subjectId: showId,
            })
        }
      })
    })
  }
}

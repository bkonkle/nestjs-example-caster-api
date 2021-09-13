import {Injectable} from '@nestjs/common'

import {Action, RuleBuilder, RuleEnhancer} from '@caster/authz'

import {UserWithProfile} from '../users/user.types'

@Injectable()
export class ProfileRules implements RuleEnhancer {
  async forUser(user: UserWithProfile | undefined, {can, cannot}: RuleBuilder) {
    // Anonymous
    can(Action.Read, 'Profile')
    cannot(Action.Read, 'Profile', ['email', 'userId', 'user'])

    if (user) {
      // Same user
      can(Action.Manage, 'Profile', {userId: user.id})
      cannot(Action.Update, 'Profile', ['userId', 'user'])
    }
  }
}

import {Injectable} from '@nestjs/common'

import {Action, RuleBuilder, RuleEnhancer} from '@caster/authz/authz.types'
import {UserWithProfile} from '../user.types'

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

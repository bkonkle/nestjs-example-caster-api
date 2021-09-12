import {User} from '@prisma/client'

import {Action, RuleBuilder, RuleEnhancer, Rules} from '@caster/authz'

@Rules()
export class UserRules implements RuleEnhancer {
  forUser(user: User | undefined, {can}: RuleBuilder): void {
    if (user) {
      // Same username
      can(Action.Create, 'User', {username: user.username})
      can(Action.Read, 'User', {username: user.username})
      can(Action.Update, 'User', {username: user.username})
    }
  }
}

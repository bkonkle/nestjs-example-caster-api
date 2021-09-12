import {User} from '@prisma/client'

import {Action, RuleBuilder, RuleEnhancer, Rules} from '@caster/authz'

@Rules()
export class ProfileRules implements RuleEnhancer {
  forUser(user: User | undefined, {can, cannot}: RuleBuilder): void {
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

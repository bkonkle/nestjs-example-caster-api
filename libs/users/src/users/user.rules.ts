import {Action, RuleBuilder, RuleEnhancer, Rules} from '@caster/authz'

import {User} from './user.model'

@Rules()
export class UserRules implements RuleEnhancer {
  forUser(user: User, {can}: RuleBuilder): void {
    // Same user
    can(Action.Create, User, {username: user.username})
    can(Action.Read, User, {username: user.username})
    can(Action.Update, User, {username: user.username})
  }
}

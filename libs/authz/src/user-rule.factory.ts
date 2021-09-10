import {Injectable} from '@nestjs/common'

import {User} from '@caster/users'

import {Action, RuleBuilder, RuleFactory} from './ability.types'

@Injectable()
export class UserRuleFactory implements RuleFactory {
  createForUser(user: User, {can}: RuleBuilder): void {
    // Same user only
    can(Action.Create, User, {username: user.username})
    can(Action.Read, User, {username: user.username})
    can(Action.Update, User, {username: user.username})
  }
}

import {Injectable} from '@nestjs/common'

/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {Action, RuleBuilder, RuleEnhancer} from '@caster/authz/authz.types'
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

import {UserWithProfile} from './user.types'

@Injectable()
export class UserRules implements RuleEnhancer {
  async forUser(user: UserWithProfile | undefined, {can}: RuleBuilder) {
    if (user) {
      // Same username
      can(Action.Create, 'User', {username: user.username})
      can(Action.Read, 'User', {username: user.username})
      can(Action.Update, 'User', {username: user.username})
    }
  }
}

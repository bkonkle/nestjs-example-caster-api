import {Injectable} from '@nestjs/common'

import {User, Profile} from '@caster/users'

import {Action, RuleBuilder, RuleFactory} from './ability.types'

@Injectable()
export class ProfileRuleFactory implements RuleFactory {
  createForUser(user: User, {can, cannot}: RuleBuilder): void {
    // Anonymous

    can(Action.Read, Profile)
    cannot(Action.Read, Profile, ['email', 'userId', 'user'])

    // Same user
    can(Action.Manage, Profile, {userId: user.id})
    cannot(Action.Update, Profile, ['userId', 'user'])
  }
}

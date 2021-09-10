import {Action, RuleBuilder, RuleEnhancer, Rules} from '@caster/authz'

import {User} from '../users/user.model'
import {Profile} from './profile.model'

@Rules()
export class ProfileRules implements RuleEnhancer {
  forUser(user: User, {can, cannot}: RuleBuilder): void {
    // Anonymous
    can(Action.Read, Profile)
    cannot(Action.Read, Profile, ['email', 'userId', 'user'])

    // Same user
    can(Action.Manage, Profile, {userId: user.id})
    cannot(Action.Update, Profile, ['userId', 'user'])
  }
}

import {Injectable} from '@nestjs/common'

import {Action, RuleBuilder, RuleEnhancer} from '@caster/authz'
import {UserWithProfile} from '@caster/users'

@Injectable()
export class EpisodeRules implements RuleEnhancer {
  async forUser(
    _user: UserWithProfile | undefined,
    {can}: RuleBuilder
  ): Promise<void> {
    // Anonymous
    can(Action.Read, 'Episode')
  }
}

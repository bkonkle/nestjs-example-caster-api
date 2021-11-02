import {User, Profile} from '@prisma/client'
import {AbilityBuilder} from '@casl/ability'
import {Inject, Injectable} from '@nestjs/common'

import {AppAbility, Rules, RuleEnhancer} from './authz.types'

/**
 * Create Casl ability instances for the App
 */
@Injectable()
export class AbilityFactory {
  constructor(@Inject(Rules) private readonly enhancers: RuleEnhancer[]) {}

  /**
   * Iterate over the registered RuleEnhancers to add rules to the Casl ability instance for a User
   */
  async createForUser(
    user?: User & {profile: Profile | null}
  ): Promise<AppAbility> {
    const {can, cannot, build} = new AbilityBuilder(AppAbility)

    // Run through each registered enhancer serially
    for (const enhancer of this.enhancers) {
      await enhancer.forUser(user, {can, cannot})
    }

    return build()
  }
}

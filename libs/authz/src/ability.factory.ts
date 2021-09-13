import {User, Profile} from '@prisma/client'
import {Ability, AbilityBuilder, AbilityClass} from '@casl/ability'
import {Inject, Injectable} from '@nestjs/common'

import {AppAbility, Rules, RuleEnhancer} from './ability.types'

@Injectable()
export class AbilityFactory {
  constructor(@Inject(Rules) private readonly enhancers: RuleEnhancer[]) {}

  async createForUser(
    user?: User & {profile: Profile | null}
  ): Promise<AppAbility> {
    const {can, cannot, build} = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    )

    await Promise.all(
      this.enhancers.map((enhancer) => enhancer.forUser(user, {can, cannot}))
    )

    return build()
  }
}

import {User} from '@prisma/client'
import {Ability, AbilityBuilder, AbilityClass} from '@casl/ability'
import {Injectable} from '@nestjs/common'

import {RulesExplorer} from './rules.explorer'
import {AppAbility} from './ability.types'

@Injectable()
export class AbilityFactory {
  constructor(private readonly rules: RulesExplorer) {}

  createForUser(user?: User): AppAbility {
    const {can, cannot, build} = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    )

    const enhancers = this.rules.explore()

    enhancers.forEach(({enhancer}) => {
      enhancer.forUser(user, {can, cannot})
    })

    return build()
  }
}

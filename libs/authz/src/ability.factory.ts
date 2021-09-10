import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability'
import {Injectable} from '@nestjs/common'

import {User} from '@caster/users'

import {RulesExplorer} from './rules.explorer'
import {AppAbility, Subjects} from './ability.types'

@Injectable()
export class AbilityFactory {
  constructor(private readonly rules: RulesExplorer) {}

  createForUser(user: User): AppAbility {
    const {can, cannot, build} = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    )

    const enhancers = this.rules.explore()

    enhancers.forEach(({enhancer}) => {
      enhancer.forUser(user, {can, cannot})
    })

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    })
  }
}

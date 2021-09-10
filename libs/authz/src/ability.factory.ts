import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability'
import {Injectable} from '@nestjs/common'

import {User} from '@caster/users'

import {AbilitiesExplorer} from './abilities.explorer'
import {AppAbility, Subjects, resolveAction} from './ability.types'

@Injectable()
export class AbilityFactory {
  constructor(private readonly explorer: AbilitiesExplorer) {}

  createForUser(user: User): AppAbility {
    const {can, cannot, build} = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    )

    const builders = this.explorer.explore()

    console.log(`>- builders ->`, builders)

    builders.forEach((builder) => {
      builder.createForUser(user, {can, cannot})
    })

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      resolveAction,
    })
  }
}

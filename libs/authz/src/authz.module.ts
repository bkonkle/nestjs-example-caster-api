import {DynamicModule, Module} from '@nestjs/common'
import {Class} from 'type-fest'

import {UsersModule} from '@caster/users/users/users.module'

import {AbilityFactory} from './ability.factory'
import {Rules, RuleEnhancer} from './authz.types'

export interface ModuleOptions {
  rules: Class<RuleEnhancer>[]
}

/**
 * AuthzModule takes a set of rule enhancers which apply Casl "can" and "cannot" expressions
 * to the Casl Ability. Use the `forRoot` dynamic module at the top level of your app to supply
 * the enhancers.
 */
@Module({
  imports: [UsersModule],
  providers: [AbilityFactory],
  exports: [UsersModule, AbilityFactory],
})
export class AuthzModule {
  static forRoot({rules: ruleClasses}: ModuleOptions): DynamicModule {
    return {
      global: true,
      module: AuthzModule,
      providers: [
        ...ruleClasses,
        {
          provide: Rules,
          useFactory: (...rules: RuleEnhancer[]) => rules,
          inject: ruleClasses,
        },
      ],
    }
  }
}

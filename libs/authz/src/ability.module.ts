import {DynamicModule, Module} from '@nestjs/common'
import {Class} from 'type-fest'

import {AbilityFactory} from './ability.factory'
import {Rules, RuleEnhancer} from './ability.types'

export interface ModuleOptions {
  rules: Class<RuleEnhancer>[]
}

/**
 * AbilityModule takes a set of rule enhancers which apply Casl "can" and "cannot" expressions
 * to the Casl Ability. Use the `forRoot` dynamic module at the top level of your app to supply
 * the enhancers.
 */
@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {
  static forRoot({rules: ruleClasses}: ModuleOptions): DynamicModule {
    return {
      global: true,
      module: AbilityModule,
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

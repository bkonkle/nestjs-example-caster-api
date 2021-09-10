import {Ability, AbilityBuilder, InferSubjects} from '@casl/ability'
import {User, Profile} from '@caster/users'

export const Action = {
  Create: 'create',
  Read: 'read',
  Update: 'update',
  Delete: 'delete',
  Manage: 'manage',
} as const
export type Action = typeof Action[keyof typeof Action]

export type Subjects = InferSubjects<typeof User | typeof Profile> | 'all'

export type AppAbility = Ability<[Action, Subjects]>

export type RuleBuilder = Pick<AbilityBuilder<AppAbility>, 'can' | 'cannot'>

export interface RuleEnhancer {
  forUser(user: User, builder: RuleBuilder): void
}

export const RULES_METADATA = 'casl:rule-enhancer'

export interface RulesMetadata {
  ruleEnhancer: true
}

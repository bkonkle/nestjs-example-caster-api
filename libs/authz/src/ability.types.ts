import {User, Profile, Show} from '@prisma/client'
import {AbilityBuilder, AbilityClass} from '@casl/ability'
import {PrismaAbility, Subjects} from '@casl/prisma'

export const Action = {
  Create: 'create',
  Read: 'read',
  Update: 'update',
  Delete: 'delete',
  Manage: 'manage',
} as const
export type Action = typeof Action[keyof typeof Action]

export type AppSubjects = Subjects<{
  User: User
  Profile: Profile
  Show: Show
}>

export type AppAbility = PrismaAbility<[string, AppSubjects]>
export const AppAbility = PrismaAbility as AbilityClass<AppAbility>

export type RuleBuilder = Pick<AbilityBuilder<AppAbility>, 'can' | 'cannot'>

export interface RuleEnhancer {
  forUser(user: User | undefined, builder: RuleBuilder): void
}

export const RULES_METADATA = 'casl:rule-enhancer'

export interface RulesMetadata {
  ruleEnhancer: true
}

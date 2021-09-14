import {User, Profile, RoleGrant, Show, Episode} from '@prisma/client'
import {AbilityBuilder, AbilityClass} from '@casl/ability'
import {PrismaAbility, Subjects} from '@casl/prisma'

import {InjectionToken} from '@caster/utils'

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
  RoleGrant: RoleGrant
  Show: Show
  Episode: Episode
}>

export type AppAbility = PrismaAbility<[string, AppSubjects]>
export const AppAbility = PrismaAbility as AbilityClass<AppAbility>

export type RuleBuilder = Pick<AbilityBuilder<AppAbility>, 'can' | 'cannot'>

export interface RuleEnhancer {
  forUser(
    user: (User & {profile: Profile | null}) | undefined,
    builder: RuleBuilder
  ): Promise<void>
}

export const Rules: InjectionToken<RuleEnhancer[]> = 'AUTHZ_CASL_RULES'

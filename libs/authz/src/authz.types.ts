import {User, Profile, RoleGrant, Show, Episode} from '@prisma/client'
import {AbilityBuilder, AbilityClass} from '@casl/ability'
import {PermittedFieldsOptions} from '@casl/ability/extra'
import {PrismaAbility, Subjects} from '@casl/prisma'

import {JwtContext, JwtRequest} from '@caster/authn'
import {InjectionToken} from '@caster/utils'
import {UserWithProfile} from '@caster/users/users/user.types'

/**
 * Abilities for the App, based on Prisma Entities
 */

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

/**
 * Rule Enhancers (used to add Casl ability rules to the AppAbility)
 */

export type RuleBuilder = Pick<AbilityBuilder<AppAbility>, 'can' | 'cannot'>

export interface RuleEnhancer {
  forUser(
    user: (User & {profile: Profile | null}) | undefined,
    builder: RuleBuilder
  ): Promise<void>
}

/**
 * The Injection Token to provide Rule Enhancers
 */
export const Rules: InjectionToken<RuleEnhancer[]> = 'AUTHZ_CASL_RULES'

/**
 * Custom JWT Request and Context objects with the metadata added to the Request.
 */

export interface AuthRequest extends JwtRequest {
  user?: UserWithProfile
  ability?: AppAbility
  censor?: <T extends AppSubjects>(
    subject: T,
    fieldOptions: PermittedFieldsOptions<AppAbility>,
    action?: Action
  ) => T
}

export interface AuthContext extends JwtContext {
  req: AuthRequest
}

/**
 * Limits the returned object to the permittedFieldsOf the subject based on the ability
 */
export type CensorFields = NonNullable<AuthRequest['censor']>

/**
 * Set metadata indicating that this route should be public.
 */
export const ALLOW_ANONYMOUS = 'auth:allow-anonymous'
export type AllowAnonymousMetadata = boolean

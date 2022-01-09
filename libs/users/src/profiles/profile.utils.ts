import {Prisma, Profile, User} from '@prisma/client'
import {PermittedFieldsOptions} from '@casl/ability/extra'

import {AppAbility} from '@caster/authz/authz.types'

export type ProfileWithUser = Profile & {user: User | null}

export const isOwner = (profile: ProfileWithUser, username?: string) =>
  username && profile.user && username === profile.user.username

export const censoredFields = ['email', 'userId', 'user'] as const
export type CensoredProfile = Omit<Profile, typeof censoredFields[number]>

export const fieldOptions: PermittedFieldsOptions<AppAbility> = {
  // Provide the list of all fields that should be revealed if the rule doesn't specify fields
  fieldsFrom: (rule) =>
    // Add the 'user' field in manually because it's on the model rather than the DB entity
    rule.fields || [...Object.values(Prisma.ProfileScalarFieldEnum), 'user'],
}

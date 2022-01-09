import {Profile, User} from '@prisma/client'
import {PermittedFieldsOptions} from '@casl/ability/extra'

import {Profile as ProfileModel} from './profile.model'
import {AppAbility} from '@caster/authz/authz.types'

export type ProfileWithUser = Profile & {user: User | null}

export const isOwner = (profile: ProfileWithUser, username?: string) =>
  username && profile.user && username === profile.user.username

export const censoredFields = ['email', 'userId', 'user'] as const
export type CensoredProfile = Omit<Profile, typeof censoredFields[number]>

export const fieldOptions: PermittedFieldsOptions<AppAbility> = {
  fieldsFrom: (rule) => rule.fields || Object.keys(ProfileModel),
}

import {Prisma, Profile, User} from '@prisma/client'
import {PermittedFieldsOptions} from '@casl/ability/extra'

import {AppAbility} from '../authz/authz.types'
import {ProfileCondition} from './profile-queries.model'
import {UpdateProfileInput} from './profile-mutations.model'

export type ProfileWithUser = Profile & {user: User | null}

export const isOwner = (profile: ProfileWithUser, username?: string) =>
  username && profile.user && username === profile.user.username

export const censoredFields = ['email', 'userId', 'user'] as const
export type CensoredProfile = Omit<Profile, typeof censoredFields[number]>

const requiredFields = [
  'id',
  'createdAt',
  'updatedAt',
  'email',
  'userId',
] as const

const fields = [
  ...requiredFields,
  'displayName',
  'picture',
  'city',
  'stateProvince',
  'user',
] as const

export const fieldOptions: PermittedFieldsOptions<AppAbility> = {
  fieldsFrom: (rule) => rule.fields || [...fields],
}

export const fromProfileCondition = (
  where?: ProfileCondition
): Prisma.ProfileWhereInput | undefined => {
  if (!where) {
    return undefined
  }

  /**
   * These required fields cannot be set to `null`, they can only be `undefined` in order for
   * Prisma to ignore them. Force them to `undefined` if they are `null`.
   */
  return requiredFields.reduce(
    (memo, field) => ({...memo, [field]: memo[field] || undefined}),
    where as Prisma.ProfileWhereInput
  )
}

/**
 * Convert any `null`s in required fields to `undefined`s for compatibility with Prisma, and
 * connect the related user.
 */
export const fromProfileInput = (
  input: UpdateProfileInput
): Prisma.ProfileUpdateInput => {
  return requiredFields.reduce((memo, field) => {
    if (field === 'userId') {
      const id = (memo as UpdateProfileInput).userId || undefined

      if (id) {
        return {...memo, user: {connect: {id}}}
      }

      return memo
    }

    return {...memo, [field]: memo[field] || undefined}
  }, input as Prisma.ProfileUpdateInput)
}

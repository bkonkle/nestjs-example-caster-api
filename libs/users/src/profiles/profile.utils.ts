import {camelCase, curry, omit} from 'lodash'
import {Prisma} from '@prisma/client'

import {Profile} from './profile.model'
import {ProfileCondition, ProfilesOrderBy} from './profile-query.model'
import {UpdateProfileInput} from './profile-input.model'

export type IncludeAll = {
  user: true
}

export const isOwner = (profile: Profile, username?: string) =>
  username && profile.user && username === profile.user?.username

export const censoredFields = ['email', 'userId', 'user'] as const
export type CensoredProfile = Omit<Profile, typeof censoredFields[number]>

/**
 * If the given username isn't from the User that owns the Profile, censor it.
 */
export const censor = curry(
  (username: string | undefined, profile: Profile): CensoredProfile => {
    if (isOwner(profile, username)) {
      return profile
    }

    return omit(profile, ...censoredFields)
  }
)

const requiredFields = [
  'id',
  'createdAt',
  'updatedAt',
  'email',
  'content',
  'userId',
] as const

export const fromProfileCondition = (
  where?: ProfileCondition
): Prisma.ProfileWhereInput | undefined => {
  if (!where) {
    return undefined
  }

  /**
   * These required fields cannot be set to `null`, they can only be `undefined` in order for Prisma
   * to ignore them. Force them to `undefined` if they are `null`.
   */
  return requiredFields.reduce(
    (memo, field) => ({...memo, [field]: memo[field] || undefined}),
    where as Prisma.ProfileWhereInput
  )
}

export const fromProfileInput = (
  input: UpdateProfileInput
): Prisma.ProfileUpdateInput => {
  // Convert any `null`s in required fields to `undefined`s, for compatibility with Prisma
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

export const fromOrderByInput = (
  orderBy?: ProfilesOrderBy[]
): Prisma.ProfileOrderByInput | undefined => {
  return orderBy?.reduce((memo, order) => {
    const index = order.lastIndexOf('_')
    const [field, direction] = [
      camelCase(order.substr(0, index)),
      order.substr(index + 1).toLowerCase(),
    ]

    return {...memo, [field]: direction}
  }, {})
}

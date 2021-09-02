import {Prisma} from '@prisma/client'

import {ShowCondition} from './show-query.model'
import {UpdateShowInput} from './show-input.model'

const requiredFields = ['id', 'createdAt', 'updatedAt', 'title'] as const

export const fromShowCondition = (
  where?: ShowCondition
): Prisma.ShowWhereInput | undefined => {
  if (!where) {
    return undefined
  }

  /**
   * These required fields cannot be set to `null`, they can only be `undefined` in order for Prisma
   * to ignore them. Force them to `undefined` if they are `null`.
   */
  return requiredFields.reduce(
    (memo, field) => ({...memo, [field]: memo[field] || undefined}),
    where as Prisma.ShowWhereInput
  )
}

export const fromShowInput = (
  input: UpdateShowInput
): Prisma.ShowUpdateInput => {
  // Convert any `null`s in required fields to `undefined`s, for compatibility with Prisma
  return requiredFields.reduce((memo, field) => {
    return {...memo, [field]: memo[field] || undefined}
  }, input as Prisma.ShowUpdateInput)
}

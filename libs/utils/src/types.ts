import {Prisma} from '@prisma/client'

/**
 * If the given property is undefined, change it to null
 */
export type ToNull<T> = T extends undefined ? null : T

/**
 * For any properties on the object that are undefined, change them to null
 */
export type ToNullProps<T> = {
  [K in keyof T]-?: ToNull<T[K]>
}

/**
 * If the given property is null, change it to undefined
 */
export type ToUndefined<T> = T extends null ? undefined : T

/**
 * For any properties on the object that are null, change them to undefined
 */
export type ToUndefinedProps<T> = {
  [K in keyof T]-?: ToUndefined<T[K]>
}

/**
 * For any properties on the object that are undefined, change them to null
 */
export const toNullProps = <T, K extends keyof T>(
  obj: T,
  props?: readonly K[]
) => {
  const keys = props ?? (Object.keys(obj) as K[])

  return keys.reduce(
    (memo, key) => {
      if (obj[key] === undefined) {
        memo[key] = null as ToNull<T[K]>
      }

      return memo
    },
    {...obj} as ToNullProps<T>
  )
}

/**
 * For any properties on the object that are null, change them to undefined
 */
export const toUndefinedProps = <T, K extends keyof T>(
  obj: T,
  props?: readonly K[]
) => {
  const keys = props ?? (Object.keys(obj) as K[])

  return keys.reduce(
    (memo, key) => {
      if (obj[key] === null) {
        memo[key] = undefined as ToUndefined<T[K]>
      }

      return memo
    },
    {...obj} as ToUndefinedProps<T>
  )
}

/**
 * Fix Json input between GraphQL and Prisma
 */
export const fixJsonInput = <T extends {content?: Prisma.JsonValue}>(
  input: T,
  value: 'DbNull' | 'JsonNull' = 'DbNull'
): T & {
  content?: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray
} => ({
  ...input,
  // Fix the Json input, because it can be either DbNull or JsonNull
  content: input.content === null ? value : input.content,
})

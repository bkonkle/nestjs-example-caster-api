/**
 * If the given property is undefined, change it to null
 */
type ToNull<T> = T extends undefined ? null : T

/**
 * For any properties on the object that are undefined, change them to null
 */
type ToNulls<T> = {
  [K in keyof T]-?: ToNull<T[K]>
}

/**
 * If the given property is null, change it to undefined
 */
type ToUndefined<T> = T extends null ? undefined : T

/**
 * For any properties on the object that are null, change them to undefined
 */
type ToUndefineds<T> = {
  [K in keyof T]-?: ToUndefined<T[K]>
}

/**
 * For any properties on the object that are undefined, change them to null
 */
export const toNullProps = <T, K extends keyof T>(obj: T) => {
  const keys = Object.keys(obj) as K[]

  return keys.reduce(
    (memo, key) => {
      if (obj[key] === undefined) {
        memo[key] = null as ToNull<T[K]>
      }

      return memo
    },
    {...obj} as ToNulls<T>
  )
}

/**
 * For any properties on the object that are null, change them to undefined
 */
export const toUndefinedProps = <T, K extends keyof T>(obj: T) => {
  const keys = Object.keys(obj) as K[]

  return keys.reduce(
    (memo, key) => {
      if (obj[key] === null) {
        memo[key] = undefined as ToUndefined<T[K]>
      }

      return memo
    },
    {...obj} as ToUndefineds<T>
  )
}

import {SelectionSetNode} from 'graphql'
import {JsonObject} from 'type-fest'
import get from 'lodash/get'
import camelCase from 'lodash/camelCase'

/**
 * Return an object indicating possibly nested relationships that should be included in a Prisma
 * query.
 */
const fromSelections = (
  selectionSet: SelectionSetNode,
  parent?: string
): JsonObject =>
  selectionSet.selections.reduce((memo, selection) => {
    if (selection.kind !== 'Field') {
      return memo
    }

    if (!selection.selectionSet) {
      if (parent && !memo[parent]) {
        return {...memo, [parent]: true}
      }

      return memo
    }

    if (parent) {
      return {
        ...memo,
        [parent]: {
          include: fromSelections(selection.selectionSet, selection.name.value),
        },
      }
    }

    return {
      ...memo,
      ...fromSelections(selection.selectionSet, selection.name.value),
    }
  }, {} as JsonObject)

/**
 * Given a GraphQL SelectionSetNode, a prefix, and a set of paths, derive the include statement for
 * Prisma.
 *
 * Example:
 *
 *     const [includeMyEntity, includeOtherEntity] = includeFromSelections(
 *       resolveInfo.operation.selectionSet,
 *       'myOperation.myField'
 *     )
 *
 */
export const includeFromSelections = (
  selectionSet: SelectionSetNode,
  path: string
) => {
  const include = fromSelections(selectionSet)

  // Translate the path to Prisma's "include" structure
  const prismaPath = `${path.split('.').join('.include.')}.include`

  return get(include, prismaPath)
}

/**
 * Given a GraphQL order by input like "DISPLAY_NAME_ASC", return Prisma orderBy input
 */
export const fromOrderByInput = <
  T extends Record<string, unknown>,
  K extends string
>(
  orderBy?: K[]
): T | undefined => {
  return orderBy?.reduce((memo, order) => {
    const index = order.lastIndexOf('_')
    const [field, direction] = [
      camelCase(order.substr(0, index)),
      order.substr(index + 1).toLowerCase(),
    ]

    return {...memo, [field]: direction}
  }, {} as T)
}

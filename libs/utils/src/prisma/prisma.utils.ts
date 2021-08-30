import {SelectionSetNode} from 'graphql'
import {JsonObject} from 'type-fest'
import get from 'lodash/get'

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

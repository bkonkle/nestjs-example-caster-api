import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

// Deep import used to avoid circular dependencies
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {getRequest} from '@caster/authz/authz.utils'

/**
 * Return the User object if present, optionally requiring it.
 */
export const RequestUser = createParamDecorator(
  (options: {require?: true} = {}, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const user = req.user

    if (user) {
      return user
    }

    if (options.require) {
      throw new UnauthorizedException()
    }
  }
)

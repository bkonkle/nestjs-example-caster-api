import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

import {getJwt, getRequest, getUsername, isAuthenticated} from './authn.utils'

/**
 * Return a boolean indicating whether a user is present on the request.
 */
export const IsAuthenticated = createParamDecorator(
  (_options: unknown, ctx: ExecutionContext) => {
    const req = getRequest(ctx)

    return isAuthenticated(req)
  }
)

/**
 * Return the jwt object if present, optionally requiring it.
 */
export const Jwt = createParamDecorator(
  (options: {require?: true} = {}, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const jwt = getJwt(req)

    if (options.require && !jwt) {
      throw new UnauthorizedException()
    }

    return jwt
  }
)

/**
 * Require and return the user sub parameter on requests.
 */
export const Username = createParamDecorator(
  (options: {require?: true} = {}, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const username = getUsername(req)

    if (options.require && !username) {
      throw new UnauthorizedException()
    }

    return username
  }
)

import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {JWT, JwtContext, JwtRequest} from './jwt.types'

const getRequest = (ctx: ExecutionContext): JwtRequest => {
  const context = GqlExecutionContext.create(ctx)

  return context.getContext<JwtContext>().req
}

/**
 * Return a boolean indicating whether a user is present on the request.
 */
export const isAuthenticated = (req: JwtRequest): boolean => Boolean(req.jwt)

/**
 * Return the user parameter on requests if present.
 */
export const getJwt = (req: JwtRequest): JWT | undefined => req.jwt

/**
 * Return the user sub parameter on requests if present.
 */
export const getUsername = (req: JwtRequest): string | undefined => req.jwt?.sub

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

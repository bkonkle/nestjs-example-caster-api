import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {JwtContext, JwtRequest} from './jwt.types'
import {getUser, getUserSub, isAuthenticated} from './jwt.utils'

const getRequest = (ctx: ExecutionContext): JwtRequest => {
  const context = GqlExecutionContext.create(ctx)

  return context.getContext<JwtContext>().req
}

/**
 * Return a boolean indicating whether a user is present on the request.
 */
export const IsAuthenticated = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequest(ctx)

    return isAuthenticated(req)
  }
)

/**
 * Require and return the user parameter on requests.
 */
export const User = createParamDecorator(
  (options: {require?: true}, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const user = getUser(req)

    if (options.require && !user) {
      throw new UnauthorizedException()
    }

    return user
  }
)

/**
 * Require and return the user sub parameter on requests.
 */
export const UserSub = createParamDecorator(
  (options: {require?: true} | undefined, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const sub = getUserSub(req)

    if (options?.require && !sub) {
      throw new UnauthorizedException()
    }

    return sub
  }
)

/**
 * Set metadata indicating that this route should be public.
 */
export const ALLOW_ANONYMOUS = 'auth:allow-anonymous'
export type AllowAnonymousMetadata = boolean

export const AllowAnonymous = () =>
  SetMetadata<string, AllowAnonymousMetadata>(ALLOW_ANONYMOUS, true)

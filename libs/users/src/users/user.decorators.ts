import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {AppAbility} from '@caster/authz'

import {UserContext, UserRequest, UserWithProfile} from './user.types'

const getRequest = (ctx: ExecutionContext): UserRequest => {
  const context = GqlExecutionContext.create(ctx)

  return context.getContext<UserContext>().req
}

/**
 * Return the user parameter on requests if present.
 */
export const getUser = (req: UserRequest): UserWithProfile | undefined =>
  req.user

/**
 * Return the ability parameter on requests if present.
 */
export const getAbility = (req: UserRequest): AppAbility | undefined =>
  req.ability

/**
 * Return the User object if present, optionally requiring it.
 */
export const RequestUser = createParamDecorator(
  (options: {require?: true} = {}, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const user = getUser(req)

    if (user) {
      return user
    }

    if (options.require) {
      throw new UnauthorizedException()
    }
  }
)

/**
 * Return the request's ability object.
 */
export const Ability = createParamDecorator(
  (_options: undefined, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const ability = getAbility(req)

    if (ability) {
      return ability
    }

    throw new UnauthorizedException()
  }
)

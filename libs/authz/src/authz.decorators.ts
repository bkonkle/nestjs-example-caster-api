import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common'

import {ALLOW_ANONYMOUS, AllowAnonymousMetadata} from './authz.types'
import {getRequest} from './authz.utils'

/**
 * Return the request's ability object.
 */
export const Ability = createParamDecorator(
  (_options: undefined, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const ability = req.ability

    if (ability) {
      return ability
    }

    throw new UnauthorizedException()
  }
)

/**
 * Return the request's censor function.
 */
export const Censor = createParamDecorator(
  (_options: undefined, ctx: ExecutionContext) => {
    const req = getRequest(ctx)
    const censor = req.censor

    if (censor) {
      return censor
    }

    throw new UnauthorizedException()
  }
)

/**
 * Allow unauthenticated requests or requests without a valid User object.
 */
export const AllowAnonymous = () =>
  SetMetadata<string, AllowAnonymousMetadata>(ALLOW_ANONYMOUS, true)

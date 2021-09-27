import {ExecutionContext, InternalServerErrorException} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {JWT, JwtRequest, JwtContext} from './authn.types'

/**
 * Get the Request from the ExecutionContext in either GraphQL or REST contexts.
 */
export const getRequest = (context: ExecutionContext): JwtRequest => {
  const req: JwtRequest | undefined = context.switchToHttp()?.getRequest()
  if (req) {
    return req
  }

  const gqlCtx: JwtContext = GqlExecutionContext.create(context).getContext()
  if (gqlCtx.req) {
    return gqlCtx.req
  }

  throw new InternalServerErrorException(
    'Unable to find JwtRequest from ExecutionContext'
  )
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

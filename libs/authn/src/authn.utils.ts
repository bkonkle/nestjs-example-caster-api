import {ExecutionContext, InternalServerErrorException} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {JwtRequest, JwtContext} from './authn.types'

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

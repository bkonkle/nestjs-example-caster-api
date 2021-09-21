import {pick} from 'lodash'
import {permittedFieldsOf, PermittedFieldsOptions} from '@casl/ability/extra'
import {ExecutionContext, InternalServerErrorException} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

import {
  Action,
  AppAbility,
  AppSubjects,
  AuthRequest,
  AuthContext,
} from './authz.types'

/**
 * Return the given object with only permitted fields based on the Casl ability
 */
export const censorFields =
  <T extends AppSubjects>(ability: AppAbility) =>
  (
    subject: T,
    fieldOptions: PermittedFieldsOptions<AppAbility>,
    action: Action = 'read'
  ): T => {
    const fields = permittedFieldsOf(ability, action, subject, fieldOptions)

    return pick(subject, fields) as T
  }

/**
 * Get the Request from the ExecutionContext in either GraphQL or REST contexts.
 */
export const getRequest = (context: ExecutionContext): AuthRequest => {
  const req: AuthRequest | undefined = context.switchToHttp()?.getRequest()
  if (req) {
    return req
  }

  const gqlCtx: AuthContext = GqlExecutionContext.create(context).getContext()

  if (gqlCtx.req) {
    return gqlCtx.req
  }

  throw new InternalServerErrorException(
    'Unable to find AuthRequest from ExecutionContext'
  )
}

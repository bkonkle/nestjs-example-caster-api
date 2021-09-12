import {ExecutionContext, Injectable, Optional} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {GqlExecutionContext} from '@nestjs/graphql'
import {AuthGuard, AuthModuleOptions} from '@nestjs/passport'
import {isObservable} from 'rxjs'

import {AllowAnonymousMetadata, ALLOW_ANONYMOUS} from './jwt.decorators'
import {JWT, JwtContext} from './jwt.types'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    protected readonly reflector: Reflector,
    @Optional() protected readonly options?: AuthModuleOptions
  ) {
    super(options)
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)

    return ctx.getContext<JwtContext>().req
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context)
    const request = this.getRequest(context)

    const allowAnonymous =
      this.reflector.getAllAndOverride<AllowAnonymousMetadata>(
        ALLOW_ANONYMOUS,
        [context.getHandler(), context.getClass()]
      )

    // The canActivate method needs to be run in order to annotate the `user` property on the
    // request, but we need to intercept failures in order to allow anonymous requests.
    let success: boolean | undefined
    try {
      success = isObservable(canActivate)
        ? await canActivate.toPromise()
        : await canActivate
    } catch (error) {
      if (allowAnonymous) {
        return true
      }

      throw error
    }

    if (allowAnonymous) {
      return true
    }

    if (success) {
      // Move the `user` property to the `jwt` property, because we want to populate the User object later
      request.jwt = request.user as JWT
      delete request.user

      return true
    }

    return false
  }
}

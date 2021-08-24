import {ExecutionContext, Injectable, Optional} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {GqlExecutionContext} from '@nestjs/graphql'
import {AuthGuard, AuthModuleOptions} from '@nestjs/passport'
import {isObservable} from 'rxjs'

import {AllowAnonymousMetadata, ALLOW_ANONYMOUS} from './jwt.decorators'
import {JwtContext} from './jwt.types'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
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

    return success || false
  }
}

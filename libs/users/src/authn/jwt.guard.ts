import {ExecutionContext, Injectable, Optional} from '@nestjs/common'
import {AuthGuard, AuthModuleOptions} from '@nestjs/passport'
import {isObservable} from 'rxjs'

import {getRequest} from './authn.utils'
import {JWT, JwtRequest} from './authn.types'

/**
 * Extends the JWT AuthGuard to allow anonymous requests and move the annotation to req.jwt.
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(@Optional() protected readonly options?: AuthModuleOptions) {
    super(options)
  }

  getRequest(context: ExecutionContext): JwtRequest {
    return getRequest(context)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context)

    // The canActivate method needs to be run in order to annotate the `user` property on the
    // request, but we need to intercept failures in order to allow anonymous requests.
    let success: boolean | undefined
    try {
      success = isObservable(canActivate)
        ? await canActivate.toPromise()
        : await canActivate
    } catch (error) {
      return true
    }

    if (!success) {
      return true
    }

    const request = this.getRequest(context)

    // Move the `user` property to the `jwt` property, because we want to populate the User object later
    request.jwt = request.user as JWT
    delete request.user

    return true
  }
}

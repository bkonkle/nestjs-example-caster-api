import {ExecutionContext, Injectable, Optional} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {AuthGuard, AuthModuleOptions} from '@nestjs/passport'
import {isObservable} from 'rxjs'
import {Socket} from 'socket.io'
import {Request} from 'express'

import {getRequest} from './authn.utils'
import {JWT, JwtRequest} from './authn.types'

/**
 * Extends the JWT AuthGuard to allow anonymous requests and move the annotation to req.jwt.
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    protected readonly reflector: Reflector,
    @Optional() protected readonly options?: AuthModuleOptions
  ) {
    super(options)
  }

  getRequest(context: ExecutionContext): JwtRequest {
    return getRequest(context)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)

    const socketReq = request as Socket
    const httpReq = request as Request

    // Handle WebSockets by populating the headers from the handshake
    if (socketReq.handshake?.headers) {
      httpReq.headers = {
        ...(httpReq.headers || {}),
        ...socketReq.handshake.headers,
      }
    }

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

    // Move the `user` property to the `jwt` property, because we want to populate the User object later
    request.jwt = httpReq.user as JWT
    delete httpReq.user

    return true
  }
}

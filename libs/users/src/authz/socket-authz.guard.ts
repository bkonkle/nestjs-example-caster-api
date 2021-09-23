import {ExecutionContext, Injectable} from '@nestjs/common'
import {WsException} from '@nestjs/websockets'

import {AuthzGuard} from './authz.guard'

/**
 * Wrap exceptions in a new WsException instance.
 */
@Injectable()
export class SocketAuthzGuard extends AuthzGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context)
    } catch (error) {
      throw new WsException((error as Error).message)
    }
  }
}

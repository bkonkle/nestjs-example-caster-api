import {Socket} from 'socket.io'
import {Request} from 'express'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {WsException} from '@nestjs/websockets'

import {AuthzGuard} from '@caster/authz'

@Injectable()
export class EventsGuard extends AuthzGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Socket | Request = context.switchToHttp()?.getRequest()

    const socketReq = request as Socket
    const httpReq = request as Request

    // Handle WebSockets by populating the headers from the handshake
    if (socketReq.handshake?.headers) {
      httpReq.headers = {
        ...(httpReq.headers || {}),
        ...socketReq.handshake.headers,
      }
    }

    try {
      return await super.canActivate(context)
    } catch (error) {
      throw new WsException((error as Error).message)
    }
  }
}

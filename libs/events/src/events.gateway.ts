import {subject} from '@casl/ability'
import {Message} from '@prisma/client'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets'
import {Logger, UseGuards} from '@nestjs/common'
import {Socket} from 'socket.io'

import {SocketJwtGuard} from '@caster/authn/socket-jwt.guard'
import {Ability, Censor} from '@caster/authz/authz.decorators'
import {SocketAuthzGuard} from '@caster/authz/socket-authz.guard'
import {Action, AppAbility, CensorFields} from '@caster/authz/authz.types'
import {RequestUser} from '@caster/users/users/user.decorators'
import {UserWithProfile} from '@caster/users/users/user.types'

import {ClientRegister, EventTypes, MessageSend} from './event.types'
import {ChannelService} from './channel.service'

@WebSocketGateway()
@UseGuards(SocketJwtGuard, SocketAuthzGuard)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  constructor(private readonly service: ChannelService) {}

  @SubscribeMessage(EventTypes.ClientRegister)
  async clientRegister(
    @MessageBody() event: ClientRegister,
    @Ability() ability: AppAbility,
    @Censor() censor: CensorFields,
    @ConnectedSocket() socket: Socket
  ) {
    // Check for authorization
    if (
      !ability.can(
        Action.Read,
        subject('Message', {
          episodeId: event.episodeId,
        } as Message)
      )
    ) {
      throw new WsException('Forbidden')
    }

    try {
      await this.service.registerClient(event, censor, socket)
    } catch (error) {
      throw new WsException((error as Error).message)
    }
  }

  @SubscribeMessage(EventTypes.MessageSend)
  async messageSend(
    @MessageBody() event: MessageSend,
    @Ability() ability: AppAbility,
    @RequestUser({require: true}) user: UserWithProfile
  ) {
    if (!user.profile) {
      throw new WsException('No User Profile found')
    }

    // Check for authorization
    if (
      !ability.can(
        Action.Create,
        subject('Message', {
          episodeId: event.episodeId,
          profileId: user.profile.id,
        } as Message)
      )
    ) {
      throw new WsException('Forbidden')
    }

    try {
      await this.service.sendMessage(event, user.profile.id)
    } catch (error) {
      throw new WsException((error as Error).message)
    }
  }

  afterInit() {
    this.logger.log('WebSocket initialized')
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Connection: ${socket.id}`)
  }
}

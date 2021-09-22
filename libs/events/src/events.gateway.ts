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

import {Censor, CensorFields} from '@caster/authz'
import {RequestUser, UserWithProfile} from '@caster/users'

import {ClientRegister, EventTypes, MessageSend} from './event.types'
import {ChannelService} from './channel.service'
import {EventsGuard} from './events.guard'

@WebSocketGateway()
@UseGuards(EventsGuard)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  constructor(private readonly service: ChannelService) {}

  @SubscribeMessage(EventTypes.ClientRegister)
  async clientRegister(
    @MessageBody() event: ClientRegister,
    @Censor() censor: CensorFields,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      await this.service.registerClient(event, censor, socket)
    } catch (error) {
      throw new WsException((error as Error).message)
    }
  }

  @SubscribeMessage(EventTypes.MessageSend)
  async messageSend(
    @MessageBody() event: MessageSend,
    @RequestUser({require: true}) user: UserWithProfile
  ) {
    if (!user.profile) {
      throw new WsException('No User Profile found')
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

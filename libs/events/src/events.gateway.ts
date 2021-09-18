import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import {Logger} from '@nestjs/common'
import {Socket} from 'socket.io'

import {AppAbility} from '@caster/authz'
import {Ability} from '@caster/users'

import {ClientRegister, EventTypes} from './event.types'
import {ChannelService} from './channel.service'

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  constructor(private readonly service: ChannelService) {}

  @SubscribeMessage(EventTypes.ClientRegister)
  async clientRegister(
    @MessageBody() event: ClientRegister,
    @Ability() ability: AppAbility,
    @ConnectedSocket() socket: Socket
  ) {
    this.service.registerClient(event, ability, socket)
  }

  @SubscribeMessage(EventTypes.MessageSend)
  async messageSend(@MessageBody() data: string): Promise<string> {
    return data
  }

  afterInit() {
    this.logger.log('WebSocket initialized')
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Connection: ${socket.id}`)
  }
}

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import {Logger, UseGuards} from '@nestjs/common'
import {Socket} from 'socket.io'

import {AuthzGuard, Censor, CensorFields} from '@caster/authz'

import {ClientRegister, EventTypes} from './event.types'
import {ChannelService} from './channel.service'

@WebSocketGateway()
@UseGuards(AuthzGuard)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  constructor(private readonly service: ChannelService) {}

  @SubscribeMessage(EventTypes.ClientRegister)
  async clientRegister(
    @MessageBody() event: ClientRegister,
    @Censor() censor: CensorFields,
    @ConnectedSocket() socket: Socket
  ) {
    this.service.registerClient(event, censor, socket)
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

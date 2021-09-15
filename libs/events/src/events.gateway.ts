import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import {Logger} from '@nestjs/common'
import {Socket} from 'socket.io'

import {EventTypes} from './event.types'

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name)

  @SubscribeMessage(EventTypes.ClientRegister)
  async clientRegister(@MessageBody() data: string) {
    console.log(`>- data ->`, data)
  }

  @SubscribeMessage(EventTypes.MessageSend)
  async messageSend(@MessageBody() data: string): Promise<string> {
    return data
  }

  @SubscribeMessage(EventTypes.MessageReceive)
  async messageReceive(@MessageBody() data: string): Promise<string> {
    return data
  }

  afterInit() {
    this.logger.log('WebSocket initialized')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Connection: ${client.id}`)
  }
}

import {Redis} from 'ioredis'
import {Socket} from 'socket.io'
import {Inject, Logger} from '@nestjs/common'

import {ProfilesService, fieldOptions} from '@caster/users'

import {
  ChatMessage,
  MessageContext,
  ClientRegister,
  EventTypes,
  MessageReceive,
  IoRedis,
} from './event.types'
import {AppAbility, censorFields} from '@caster/authz'
import {subject} from '@casl/ability'

export class ChannelService {
  private readonly logger = new Logger(ChannelService.name)

  constructor(
    @Inject(IoRedis) private readonly redis: Redis,
    private readonly profiles: ProfilesService
  ) {}

  registerClient = async (
    event: ClientRegister,
    ability: AppAbility,
    socket: Socket
  ): Promise<void> => {
    const context = {episodeId: event.episodeId, ability, socket}

    this.redis.on('message', this.handleMessage(context))

    this.redis.on('messageBuffer', this.handleMessage(context))

    this.redis.subscribe(`ep:${event.episodeId}`, (err, _count) => {
      if (err) {
        this.logger.error(
          `Error during Redis subscribe for profileId - ${event.profileId}, channel - "ep:${event.episodeId}"`,
          err
        )

        return
      }
    })
  }

  /**
   * Handle Redis pub/sub events for the given WebSocket client.
   */
  handleMessage =
    (context: MessageContext) =>
    async (
      channel: string | Buffer,
      message: string | Buffer
    ): Promise<void> => {
      const {episodeId, ability, socket} = context
      const {text, sender}: Partial<ChatMessage> = JSON.parse(`${message}`)

      const senderProfile =
        sender && (await this.profiles.get(sender.profileId))

      if (!senderProfile) {
        this.logger.error(
          `Error: Cannot find Profile for message received on channel "${channel}" - ${message}`
        )

        return
      }

      if (!text) {
        this.logger.error(
          `Error: Message received on channel "${channel}" with no text - ${message}`
        )

        return
      }

      const censoredSender = censorFields(subject('Profile', senderProfile), {
        ability,
        fieldOptions,
      })

      const receiveEvent: MessageReceive = {
        episodeId,
        sender: censoredSender,
        text,
      }

      socket.emit(EventTypes.MessageReceive, receiveEvent)
    }
}

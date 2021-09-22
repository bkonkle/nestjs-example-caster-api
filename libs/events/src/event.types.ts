import {Redis} from 'ioredis'
import {Socket} from 'socket.io'

import {CensorFields} from '@caster/authz/authz.types'
import {ProfileWithUser} from '@caster/users/profiles/profile.utils'
import {InjectionToken} from '@caster/utils/injection'

export const EventTypes = {
  ClientRegister: 'client-register',
  ClientRegistered: 'client-registered',
  Ping: 'ping',
  MessageSend: 'message-send',
  MessageReceive: 'message-receive',
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export interface ClientRegister {
  episodeId: string
  profileId: string
}

export interface MessageSend {
  episodeId: string
  text: string
}

export interface MessageReceive {
  episodeId: string
  sender: ProfileWithUser
  text: string
}

/**
 * Redis Event Bus
 */
export const Publisher: InjectionToken<Redis> = 'EVENTS_IOREDIS_PUBLISHER'

export const Subscriber: InjectionToken<Redis> = 'EVENTS_IOREDIS_SUBSCRIBER'

export interface MessageContext {
  episodeId: string
  censor: CensorFields
  socket: Socket
}

/**
 * A chat message send on a Redis channel
 */
export interface ChatMessage {
  sender: {
    profileId: string
  }
  text: string
}

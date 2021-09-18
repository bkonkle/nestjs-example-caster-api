import {Redis} from 'ioredis'
import {Socket} from 'socket.io'

import {AppAbility} from '@caster/authz'
import {ProfileWithUser} from '@caster/users'
import {InjectionToken} from '@caster/utils'

export const EventTypes = {
  ClientRegister: 'client-register',
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
export const IoRedis: InjectionToken<Redis> = 'EVENTS_IOREDIS'

/**
 * A chat message send on a Redis channel
 */
export interface ChatMessage {
  sender: {
    profileId: string
  }
  text: string
}

export interface MessageContext {
  episodeId: string
  ability: AppAbility
  socket: Socket
}

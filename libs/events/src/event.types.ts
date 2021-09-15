export const EventTypes = {
  ClientRegister: 'client-register',
  Ping: 'ping',
  MessageSend: 'message-send',
  MessageReceive: 'message-receive',
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export interface ClientRegister {
  episodeId?: string
}

export interface MessageSend {
  episodeId: string
  text: string
}

export interface MessageReceive {
  episodeId: string
  profileId: string
  text: string
}

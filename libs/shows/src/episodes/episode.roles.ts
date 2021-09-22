import {Permission, Role} from '@caster/roles'

/**
 * Permissions
 */

export const Chat: Permission = {
  key: 'EPISODE_CHAT',
  name: 'Episode Chat',
  description: 'Chat about an Episode',
}

export const ReadChat: Permission = {
  key: 'EPISODE_READ_CHAT',
  name: 'Read Episode Chat',
  description: 'Read chat Messages for an Episode',
}

export const permissions = [Chat, ReadChat]

/**
 * Roles
 */

export const Reader: Role = {
  key: 'EPISODE_READER',
  name: 'Episode Reader',
  description: 'Able to read chat Messages about a particular episode',
  permissions: [ReadChat],
}

export const Guest: Role = {
  key: 'EPISODE_GUEST',
  name: 'Episode Guest',
  description: 'Able to Chat about a particular episode',
  permissions: [Chat, ReadChat],
}

export const roles = [Reader, Guest]

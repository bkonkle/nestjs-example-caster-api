import faker from 'faker'

import {
  ClientRegister,
  MessageReceive,
  MessageSend,
} from '@caster/events/event.types'
import {UserFactory} from '@caster/users/test/factories/user.factory'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'
import {toNullProps} from '@caster/utils/types'

export const makeClientRegisterEvent = (
  overrides?: Partial<ClientRegister>
): ClientRegister => {
  return {
    episodeId: faker.datatype.uuid(),
    profileId: faker.datatype.uuid(),
    ...overrides,
  }
}

export const makeMessageSend = (
  overrides?: Partial<MessageSend>
): MessageSend => {
  return {
    episodeId: faker.datatype.uuid(),
    text: faker.lorem.paragraphs(2),
    ...overrides,
  }
}

export const makeMessageReceive = (
  overrides?: Partial<MessageReceive>
): MessageReceive => {
  const profile = ProfileFactory.make()

  const sender = overrides?.sender ?? {
    ...profile,

    // Fix the email field, since it may be undefined on the Model but not the DB entity
    email: profile.email ?? 'temp',

    user: UserFactory.make(),
  }

  return {
    episodeId: faker.datatype.uuid(),
    sender: toNullProps(sender),
    text: faker.lorem.paragraphs(2),
    ...overrides,
  }
}

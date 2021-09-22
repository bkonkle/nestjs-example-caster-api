import faker from 'faker'

import {Profile} from '../../src/profiles/profile.model'
import {CreateProfileInput} from '../../src/profiles/profile-mutations.model'

export const makeCreateInput = (
  overrides?: Partial<CreateProfileInput> | null
): CreateProfileInput => {
  return {
    email: faker.internet.email(),
    displayName: faker.name.findName(),
    picture: faker.internet.avatar(),
    userId: faker.datatype.uuid(),
    ...overrides,
  }
}

export const make = (overrides?: Partial<Profile> | null): Profile => {
  return {
    id: faker.datatype.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...makeCreateInput(overrides as Partial<CreateProfileInput>),
    ...overrides,
  }
}

export default {make, makeCreateInput}

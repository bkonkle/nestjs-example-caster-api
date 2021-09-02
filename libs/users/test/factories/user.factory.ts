import faker from 'faker'

import {User, CreateUserInput} from '../../src/users'

export const makeCreateInput = (
  overrides?: Partial<Omit<CreateUserInput, 'profile'>> | null
): Omit<CreateUserInput, 'profile'> => ({
  ...overrides,
  username: faker.random.alphaNumeric(10),
})

export const make = (overrides?: Partial<User> | null): User => ({
  id: faker.datatype.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  isActive: true,
  profile: null,
  ...makeCreateInput(overrides),
  ...overrides,
})

export default {make, makeCreateInput}

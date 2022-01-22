import faker from 'faker'

import {User} from '../../src/user.model'
import {CreateUserInput} from '../../src/user-mutations.model'

export const makeCreateInput = (
  overrides?: Partial<Omit<CreateUserInput, 'profile'>>
): Omit<CreateUserInput, 'profile'> => ({
  ...overrides,
})

export const make = (overrides?: Partial<User>): User => ({
  id: faker.datatype.uuid(),
  username: faker.random.alphaNumeric(10),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  isActive: true,
  ...makeCreateInput(overrides),
  ...overrides,
})

export const UserFactory = {make, makeCreateInput}

import faker from 'faker'

import {Show, CreateShowInput} from '../../src/shows'

export const makeCreateInput = (
  overrides?: Partial<CreateShowInput> | null
): CreateShowInput => {
  return {
    title: faker.hacker.noun(),
    summary: faker.lorem.paragraphs(1),
    picture: faker.image.imageUrl(),
    content: {},
    ...overrides,
  }
}

export const make = (overrides?: Partial<Show> | null): Show => {
  return {
    id: faker.datatype.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...makeCreateInput(overrides as Partial<CreateShowInput>),
    ...overrides,
  }
}

export default {make, makeCreateInput}

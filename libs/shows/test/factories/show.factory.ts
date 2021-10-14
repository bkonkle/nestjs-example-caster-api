import faker from 'faker'

import {Show} from '../../src/show.model'
import {CreateShowInput} from '../../src/show-mutations.model'

export const makeCreateInput = (
  overrides?: Partial<CreateShowInput>
): CreateShowInput => {
  return {
    title: faker.hacker.noun(),
    summary: faker.lorem.paragraphs(1),
    picture: faker.image.imageUrl(),
    content: {},
    ...overrides,
  }
}

export const make = (overrides?: Partial<Show>): Show => {
  return {
    id: faker.datatype.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...makeCreateInput(overrides as Partial<CreateShowInput>),
    ...overrides,
  }
}

export const ShowFactory = {make, makeCreateInput}

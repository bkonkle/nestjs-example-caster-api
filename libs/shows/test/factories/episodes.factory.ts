import faker from 'faker'

import {Episode} from '../../src/episodes/episode.model'
import {CreateEpisodeInput} from '../../src/episodes/episode-mutations.model'

export const makeCreateInput = (
  overrides?: Partial<CreateEpisodeInput> | null
): CreateEpisodeInput => {
  return {
    title: faker.hacker.noun(),
    summary: faker.lorem.paragraphs(1),
    picture: faker.image.imageUrl(),
    content: {},
    showId: faker.datatype.uuid(),
    ...overrides,
  }
}

export const make = (overrides?: Partial<Episode> | null): Episode => {
  return {
    id: faker.datatype.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...makeCreateInput(overrides as Partial<CreateEpisodeInput>),
    ...overrides,
  }
}

export const EpisodeFactory = {make, makeCreateInput}

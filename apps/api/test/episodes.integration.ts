import faker from 'faker'
import {Profile, User, Show, Episode, RoleGrant} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {omit, pick} from 'lodash'
import {PrismaService} from 'nestjs-prisma'

import {OAuth2} from '@caster/utils/test/oauth2'
import {GraphQL} from '@caster/utils/test/graphql'
import {Validation} from '@caster/utils/test/validation'
import {dbCleaner} from '@caster/utils/test/prisma'
import {CreateEpisodeInput} from '@caster/shows/episodes/episode-mutations.model'
import {Admin, Manager} from '@caster/shows/show.roles'
import {ShowFactory} from '@caster/shows/test/factories/show.factory'
import {EpisodeFactory} from '@caster/shows/test/factories/episodes.factory'
import {Query, Mutation} from '@caster/graphql/schema'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'

import {AppModule} from '../src/app.module'

// Fields that should be selected in successful responses
const fields = [
  'id',
  'title',
  'summary',
  'picture',
  'content',
  'showId',
] as const

type PartialEpisode = Pick<Episode, typeof fields[number]>

describe('Episodes', () => {
  let app: INestApplication
  let graphql: GraphQL

  let user: User
  let otherUser: User
  let show: Show

  let profile: Profile
  // @ts-expect-error - Needs to exist, but isn't used
  let _otherProfile: Profile

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = new PrismaService()

  const tables = ['User', 'Profile', 'Show', 'Episode']

  const createEpisode = (input: CreateEpisodeInput) =>
    prisma.episode.create({
      data: {
        ...input,
        showId: undefined,
        show: {
          connect: {id: show.id},
        },
      },
    })

  const deleteEpisode = (id: string) => prisma.episode.delete({where: {id}})

  beforeAll(async () => {
    await dbCleaner(prisma, tables)

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    await app.init()

    graphql = new GraphQL(app.getHttpServer())
  })

  beforeAll(async () => {
    const {username} = credentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    user = await prisma.user.create({data: {username, isActive: true}})

    profile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: user.id}),
    })

    show = await prisma.show.create({
      data: ShowFactory.makeCreateInput(),
    })
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    otherUser = await prisma.user.create({data: {username, isActive: true}})

    _otherProfile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: otherUser.id}),
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Mutation: createEpisode', () => {
    const mutation = `
      mutation CreateEpisode($input: CreateEpisodeInput!) {
        createEpisode(input: $input) {
          episode {
            id
            title
            summary
            picture
            content
            showId
          }
        }
      }
    `

    let roleGrant: RoleGrant

    beforeAll(async () => {
      roleGrant = await prisma.roleGrant.create({
        data: {
          roleKey: Manager.key,
          profileId: profile.id,
          subjectTable: 'Show',
          subjectId: show.id,
        },
      })
    })

    afterAll(async () => {
      await prisma.roleGrant.delete({where: {id: roleGrant.id}})
    })

    it('creates a new episode', async () => {
      const {token} = credentials
      const episode = EpisodeFactory.makeCreateInput({showId: show.id})
      const variables = {input: episode}

      const expected = {
        ...episode,
        id: expect.stringMatching(Validation.uuidRegex),
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'createEpisode'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.createEpisode).toHaveProperty(
        'episode',
        expect.objectContaining(expected)
      )

      const created = await prisma.episode.findFirst({
        where: {id: data.createEpisode.episode?.id},
      })

      if (!created) {
        fail('No episode created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.createEpisode.episode?.id,
      })

      await prisma.episode.delete({
        where: {id: created.id},
      })
    })

    it('requires a title', async () => {
      const {token} = credentials
      const episode = omit(EpisodeFactory.makeCreateInput({showId: show.id}), [
        'title',
      ])
      const variables = {input: episode}

      const body = await graphql.mutation(mutation, variables, {
        token,
        statusCode: 400,
        warn: false,
      })

      expect(body).toHaveProperty(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(
              'Field "title" of required type "String!" was not provided.'
            ),
          }),
        ])
      )
    })

    it('requires authentication', async () => {
      const episode = EpisodeFactory.makeCreateInput({showId: show.id})
      const variables = {input: episode}

      const body = await graphql.mutation(mutation, variables, {warn: false})

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {message: 'Unauthorized', statusCode: 401},
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = credentials
      const episode = EpisodeFactory.makeCreateInput({showId: show.id})
      const variables = {input: episode}

      const expected = {
        ...episode,
        id: expect.stringMatching(Validation.uuidRegex),
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'createEpisode'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.createEpisode).toHaveProperty(
        'episode',
        expect.objectContaining(expected)
      )

      const created = await prisma.episode.findFirst({
        where: {id: data.createEpisode.episode?.id},
      })

      if (!created) {
        fail('No episode created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.createEpisode.episode?.id,
      })

      await prisma.episode.delete({
        where: {id: created.id},
      })
    })
  })

  describe('Query: getEpisode', () => {
    let episode: Episode
    let episodeInput: CreateEpisodeInput
    let expected: PartialEpisode

    const query = `
      query GetEpisode($id: ID!) {
        getEpisode(id: $id) {
          id
          title
          summary
          picture
          content
          showId
        }
      }
    `

    beforeAll(async () => {
      episodeInput = EpisodeFactory.makeCreateInput({showId: show.id})

      episode = await createEpisode(episodeInput)

      expected = pick(episode, fields)
    })

    afterAll(async () => {
      try {
        await deleteEpisode(episode.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves an existing episode', async () => {
      const {token} = credentials
      const variables = {id: episode.id}

      const {data} = await graphql.query<Pick<Query, 'getEpisode'>>(
        query,
        variables,
        {token}
      )

      expect(data.getEpisode).toEqual(expected)
    })

    it('returns nothing when no episode is found', async () => {
      const {token} = credentials
      const variables = {id: episode.id}

      await deleteEpisode(episode.id)

      const {data} = await graphql.query<Pick<Query, 'getEpisode'>>(
        query,
        variables,
        {token}
      )

      expect(data.getEpisode).toBeFalsy()

      // Restore the episode for other tests
      episode = await createEpisode(episodeInput)
    })
  })

  describe('Query: getManyEpisodes', () => {
    let episode: Episode
    let episodeInput: CreateEpisodeInput

    let otherEpisode: Episode
    let otherInput: CreateEpisodeInput

    const query = `
      query GetManyEpisodes(
        $where: EpisodeCondition
        $orderBy: [EpisodesOrderBy!]
        $pageSize: Int
        $page: Int
      ) {
        getManyEpisodes(
        where: $where
        orderBy: $orderBy
        pageSize: $pageSize
        page: $page
        ) {
          data {
            id
            title
            summary
            picture
            content
            showId
          }
          count
          total
          page
          pageCount
        }
      }
    `

    beforeAll(async () => {
      episodeInput = EpisodeFactory.makeCreateInput({showId: show.id})
      otherInput = EpisodeFactory.makeCreateInput({showId: show.id})

      episode = await createEpisode(episodeInput)
      otherEpisode = await createEpisode(otherInput)
    })

    afterAll(async () => {
      try {
        await deleteEpisode(episode.id)
        await deleteEpisode(otherEpisode.id)
      } catch (_err) {
        // pass
      }
    })

    it('queries existing episodes', async () => {
      const {token} = credentials
      const variables = {}

      const {data} = await graphql.query<Pick<Query, 'getManyEpisodes'>>(
        query,
        variables,
        {token}
      )
      expect(data.getManyEpisodes).toEqual({
        data: expect.arrayContaining([
          pick(episode, fields),
          pick(otherEpisode, fields),
        ]),
        count: 2,
        page: 1,
        pageCount: 1,
        total: 2,
      })
    })
  })

  describe('Mutation: updateEpisode', () => {
    let episode: Episode
    let episodeInput: CreateEpisodeInput
    let roleGrant: RoleGrant

    let expected: PartialEpisode

    const mutation = `
      mutation UpdateEpisode($id: ID!, $input: UpdateEpisodeInput!) {
        updateEpisode(id: $id, input: $input) {
          episode {
            id
            title
            summary
            picture
            content
            showId
          }
        }
      }
    `

    beforeAll(async () => {
      episodeInput = EpisodeFactory.makeCreateInput({showId: show.id})

      episode = await createEpisode(episodeInput)

      // Grant the "user" Admin permissions, but don't give that "otherUser" anything
      roleGrant = await prisma.roleGrant.create({
        data: {
          profileId: profile.id,
          roleKey: Admin.key,
          subjectTable: 'Show',
          subjectId: show.id,
        },
      })

      expected = pick(episode, fields)
    })

    afterAll(async () => {
      try {
        await deleteEpisode(episode.id)
        await prisma.roleGrant.delete({where: {id: roleGrant.id}})
      } catch (_err) {
        // pass
      }
    })

    it('updates an existing show episode', async () => {
      const {token} = credentials
      const variables = {
        id: episode.id,
        input: {picture: faker.internet.avatar()},
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'updateEpisode'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.updateEpisode).toHaveProperty(
        'episode',
        expect.objectContaining({
          ...expected,
          picture: variables.input.picture,
        })
      )

      const updated = await prisma.episode.findFirst({
        where: {id: episode.id},
      })
      expect(updated).toMatchObject({
        ...expected,
        picture: variables.input.picture,
      })

      // Restore the episode for other tests
      episode = await createEpisode(episodeInput)
    })

    it('returns an error if no existing episode was found', async () => {
      const {token} = credentials
      const variables = {
        id: faker.datatype.uuid(),
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation<Pick<Mutation, 'updateEpisode'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Not Found',
          extensions: {
            code: '404',
            response: {message: 'Not Found', statusCode: 404},
          },
        }),
      ])
    })

    it('requires authentication', async () => {
      const variables = {
        id: faker.datatype.uuid(),
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation<Pick<Mutation, 'updateEpisode'>>(
        mutation,
        variables,
        {warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {message: 'Unauthorized', statusCode: 401},
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = altCredentials
      const variables = {
        id: episode.id,
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation<Pick<Mutation, 'updateEpisode'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Forbidden',
          extensions: {
            code: 'FORBIDDEN',
            response: {message: 'Forbidden', statusCode: 403},
          },
        }),
      ])
    })
  })

  describe('Mutation: deleteEpisode', () => {
    let episode: Episode
    let episodeInput: CreateEpisodeInput
    let roleGrant: RoleGrant

    const mutation = `
        mutation DeleteEpisode($id: ID!) {
          deleteEpisode(id: $id)
        }
      `

    beforeAll(async () => {
      episodeInput = EpisodeFactory.makeCreateInput({showId: show.id})

      episode = await createEpisode(episodeInput)

      // Grant the "user" Admin permissions, but don't give that "otherUser" anything
      await prisma.roleGrant.create({
        data: {
          profileId: profile.id,
          roleKey: Admin.key,
          subjectTable: 'Show',
          subjectId: show.id,
        },
      })
    })

    afterAll(async () => {
      try {
        await deleteEpisode(episode.id)
        await prisma.roleGrant.delete({where: {id: roleGrant.id}})
      } catch (_err) {
        // pass
      }
    })

    it('deletes an existing user episode', async () => {
      const {token} = credentials
      const variables = {id: episode.id}

      const {data} = await graphql.mutation<Pick<Mutation, 'deleteEpisode'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.deleteEpisode).toBe(true)

      const deleted = await prisma.episode.findFirst({
        where: {id: episode.id},
      })
      expect(deleted).toBeNull()

      // Restore the episode for other tests
      episode = await createEpisode(episodeInput)
    })

    it('returns an error if no existing episode was found', async () => {
      const {token} = credentials
      const variables = {id: faker.datatype.uuid()}

      const body = await graphql.mutation<Pick<Mutation, 'deleteEpisode'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Not Found',
          extensions: {
            code: '404',
            response: {
              message: 'Not Found',
              statusCode: 404,
            },
          },
        }),
      ])
    })

    it('requires authentication', async () => {
      const variables = {id: faker.datatype.uuid()}

      const body = await graphql.mutation<Pick<Mutation, 'deleteEpisode'>>(
        mutation,
        variables,
        {warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {
              message: 'Unauthorized',
              statusCode: 401,
            },
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = altCredentials
      const variables = {id: episode.id}

      const body = await graphql.mutation<Pick<Mutation, 'deleteEpisode'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Forbidden',
          extensions: {
            code: 'FORBIDDEN',
            response: {message: 'Forbidden', statusCode: 403},
          },
        }),
      ])
    })
  })
})

import faker from 'faker'
import {Show} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {omit, pick} from 'lodash'
import {PrismaService} from 'nestjs-prisma'

import {OAuth2, GraphQL, Validation, dbCleaner} from '@caster/utils/test'
import {CreateShowInput} from '@caster/shows'
import {ShowFactory} from '@caster/shows/test'
import {Query, Mutation} from '@caster/graphql/schema'

import {AppModule} from '../src/app.module'

// Fields that should be selected in successful responses
const fields = ['id', 'title', 'summary', 'picture', 'content'] as const

type PartialShow = Pick<Show, typeof fields[number]>

describe('Shows', () => {
  let app: INestApplication
  let graphql: GraphQL

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = new PrismaService()

  const tables = ['Show']

  const createShow = (input: CreateShowInput) =>
    prisma.show.create({
      data: input,
    })

  const deleteShow = (id: string) => prisma.show.delete({where: {id}})

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
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Mutation: createShow', () => {
    const mutation = `
      mutation CreateShow($input: CreateShowInput!) {
        createShow(input: $input) {
          show {
            id
            title
            summary
            picture
            content
          }
        }
      }
    `

    it('creates a new show', async () => {
      const {token} = credentials
      const show = ShowFactory.makeCreateInput()
      const variables = {input: show}

      const expected = {
        ...show,
        id: expect.stringMatching(Validation.uuidRegex),
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'createShow'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.createShow).toHaveProperty(
        'show',
        expect.objectContaining(expected)
      )

      const created = await prisma.show.findFirst({
        where: {id: data.createShow.show?.id},
      })

      if (!created) {
        fail('No show created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.createShow.show?.id,
      })

      await prisma.show.delete({
        where: {id: created.id},
      })
    })

    it('requires a title', async () => {
      const {token} = credentials
      const show = omit(ShowFactory.makeCreateInput(), ['title'])
      const variables = {input: show}

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

    it.todo('requires authentication')

    it.todo('requires authorization')
  })

  describe('Query: getShow', () => {
    let show: Show
    let showInput: CreateShowInput
    let expected: PartialShow

    const query = `
      query GetShow($id: ID!) {
        getShow(id: $id) {
          id
          title
          summary
          picture
          content
        }
      }
    `

    beforeAll(async () => {
      showInput = ShowFactory.makeCreateInput()

      show = await createShow(showInput)

      expected = pick(show, fields)
    })

    afterAll(async () => {
      try {
        await deleteShow(show.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves an existing show', async () => {
      const {token} = credentials
      const variables = {id: show.id}

      const {data} = await graphql.query<Pick<Query, 'getShow'>>(
        query,
        variables,
        {token}
      )

      expect(data.getShow).toEqual(expected)
    })

    it('returns nothing when no show is found', async () => {
      const {token} = credentials
      const variables = {id: show.id}

      await deleteShow(show.id)

      const {data} = await graphql.query<Pick<Query, 'getShow'>>(
        query,
        variables,
        {token}
      )

      expect(data.getShow).toBeFalsy()

      // Restore the show for other tests
      show = await createShow(showInput)
    })
  })

  describe('Query: getManyShows', () => {
    let show: Show
    let showInput: CreateShowInput

    let otherShow: Show
    let otherInput: CreateShowInput

    const query = `
      query GetManyShows(
        $where: ShowCondition
        $orderBy: [ShowsOrderBy!]
        $pageSize: Int
        $page: Int
      ) {
        getManyShows(
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
          }
          count
          total
          page
          pageCount
        }
      }
    `

    beforeAll(async () => {
      showInput = ShowFactory.makeCreateInput()
      otherInput = ShowFactory.makeCreateInput()

      show = await createShow(showInput)
      otherShow = await createShow(otherInput)
    })

    afterAll(async () => {
      try {
        await deleteShow(show.id)
        await deleteShow(otherShow.id)
      } catch (_err) {
        // pass
      }
    })

    it('queries existing shows', async () => {
      const {token} = credentials
      const variables = {}

      const {data} = await graphql.query<Pick<Query, 'getManyShows'>>(
        query,
        variables,
        {token}
      )
      expect(data.getManyShows).toEqual({
        data: expect.arrayContaining([
          pick(show, fields),
          pick(otherShow, fields),
        ]),
        count: 2,
        page: 1,
        pageCount: 1,
        total: 2,
      })
    })
  })

  describe('Mutation: updateShow', () => {
    let show: Show
    let showInput: CreateShowInput

    let expected: PartialShow

    const mutation = `
      mutation UpdateShow($id: ID!, $input: UpdateShowInput!) {
        updateShow(id: $id, input: $input) {
          show {
            id
            title
            summary
            picture
            content
          }
        }
      }
    `

    beforeAll(async () => {
      showInput = ShowFactory.makeCreateInput()

      show = await createShow(showInput)

      expected = pick(show, fields)
    })

    afterAll(async () => {
      try {
        await deleteShow(show.id)
      } catch (_err) {
        // pass
      }
    })

    it('updates an existing user show', async () => {
      const {token} = credentials
      const variables = {
        id: show.id,
        input: {picture: faker.internet.avatar()},
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'updateShow'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.updateShow).toHaveProperty(
        'show',
        expect.objectContaining({
          ...expected,
          picture: variables.input.picture,
        })
      )

      const updated = await prisma.show.findFirst({
        where: {id: show.id},
      })
      expect(updated).toMatchObject({
        ...expected,
        picture: variables.input.picture,
      })

      // Restore the show for other tests
      show = await createShow(showInput)
    })

    it('returns an error if no existing show was found', async () => {
      const {token} = credentials
      const variables = {
        id: faker.datatype.uuid(),
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation<Pick<Mutation, 'updateShow'>>(
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

    it.todo('requires authentication')

    it.todo('requires authorization')
  })

  describe('Mutation: deleteShow', () => {
    let show: Show
    let showInput: CreateShowInput

    const mutation = `
        mutation DeleteShow($id: ID!) {
          deleteShow(id: $id)
        }
      `

    beforeAll(async () => {
      showInput = ShowFactory.makeCreateInput()

      show = await createShow(showInput)
    })

    afterAll(async () => {
      try {
        await deleteShow(show.id)
      } catch (_err) {
        // pass
      }
    })

    it('deletes an existing user show', async () => {
      const {token} = credentials
      const variables = {id: show.id}

      const {data} = await graphql.mutation<Pick<Mutation, 'deleteShow'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.deleteShow).toBe(true)

      const deleted = await prisma.show.findFirst({
        where: {id: show.id},
      })
      expect(deleted).toBeNull()

      // Restore the show for other tests
      show = await createShow(showInput)
    })

    it('returns an error if no existing show was found', async () => {
      const {token} = credentials
      const variables = {id: faker.datatype.uuid()}

      const body = await graphql.mutation<Pick<Mutation, 'deleteShow'>>(
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

    it.todo('requires authentication')

    it.todo('requires authorization')
  })
})

import {Prisma, User} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {PrismaService} from 'nestjs-prisma'

import {OAuth2} from '@caster/utils/test/oauth2'
import {GraphQL} from '@caster/utils/test/graphql'
import {Query, Mutation} from '@caster/graphql/schema'

import {AppModule} from '../src/app.module'

describe('Users', () => {
  let app: INestApplication
  let graphql: GraphQL

  const {credentials} = OAuth2.init()
  const prisma = new PrismaService()

  const createUser = async (
    input: Omit<Prisma.UserCreateInput, 'username'>
  ) => {
    if (!credentials.username) {
      fail('No username found')
    }

    return prisma.user.upsert({
      where: {username: credentials.username},
      create: {
        ...input,
        username: credentials.username,
      },
      update: {
        ...input,
        username: credentials.username,
      },
    })
  }

  const deleteUser = async (id: string) => {
    const user = await prisma.user.findFirst({
      include: {profile: true},
      where: {id},
    })

    if (user?.profile?.id) {
      return prisma.profile.delete({where: {id: user.profile.id}})
    }

    return prisma.user.delete({where: {id}})
  }

  beforeAll(async () => {
    await prisma.user.deleteMany({where: {}})

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    await app.init()

    graphql = new GraphQL(app.getHttpServer())
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Query: getCurrentUser', () => {
    let user: User

    const query = `
      query GetCurrentUser {
        getCurrentUser {
          id
          username
          isActive
        }
      }
    `

    const userInput = {isActive: true}

    beforeAll(async () => {
      user = await createUser(userInput)
    })

    afterAll(async () => {
      try {
        await deleteUser(user.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves the currently authenticated user', async () => {
      const {token, username} = credentials

      const {data} = await graphql.query<Pick<Query, 'getCurrentUser'>>(
        query,
        undefined,
        {token}
      )

      expect(data.getCurrentUser).toEqual({
        id: user.id,
        username,
        isActive: true,
      })
    })

    it('returns null when no user is found', async () => {
      const {token} = credentials

      await deleteUser(user.id)

      const {data} = await graphql.query<Pick<Query, 'getCurrentUser'>>(
        query,
        undefined,
        {token}
      )

      expect(data.getCurrentUser).toBeFalsy()

      // Restore the user for other tests
      user = await createUser(userInput)
    })

    it('requires authentication', async () => {
      const body = await graphql.query(query, undefined, {warn: false})

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
  })

  describe('Mutation: getOrCreateCurrentUser', () => {
    let user: User

    const mutation = `
      mutation GetOrCreateCurrentUser($input: CreateUserInput!) {
        getOrCreateCurrentUser(input: $input) {
          user {
            id
            username
            isActive
            profile {
              id
              email
            }
          }
        }
      }
    `

    const email = 'test-email'
    const userInput = {isActive: true, profile: {create: {email}}}

    beforeAll(async () => {
      user = await createUser(userInput)
    })

    afterAll(async () => {
      try {
        await deleteUser(user.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves the currently authenticated user', async () => {
      const {token, username} = credentials
      const variables = {input: {profile: {email}}}

      const {data} = await graphql.mutation<
        Pick<Mutation, 'getOrCreateCurrentUser'>
      >(mutation, variables, {token})

      expect(data.getOrCreateCurrentUser.user).toEqual({
        id: user.id,
        username,
        isActive: true,
        profile: {
          id: expect.any(String),
          email,
        },
      })
    })

    it('uses the input to create one when no user is found', async () => {
      const {token, username} = credentials
      const variables = {input: {profile: {email}}}

      const expected = {
        id: expect.any(String),
        username,
        isActive: true,
      }

      // Delete the user so that no user is found
      await deleteUser(user.id)

      const {data} = await graphql.mutation<
        Pick<Mutation, 'getOrCreateCurrentUser'>
      >(mutation, variables, {token})

      expect(data.getOrCreateCurrentUser).toHaveProperty(
        'user',
        expect.objectContaining(expected)
      )

      // Check to make sure the user was created
      const created = await prisma.user.findFirst({
        where: {
          id: data.getOrCreateCurrentUser.user?.id,
        },
      })

      if (!created) {
        fail('No user created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.getOrCreateCurrentUser.user?.id,
      })

      // Delete the one-off user created in this test
      await prisma.user.delete({
        where: {
          id: created.id,
        },
      })

      // Restore the original user for other tests
      user = await createUser(userInput)
    })

    it('requires authentication', async () => {
      const variables = {input: {profile: {email}}}

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
  })

  describe('Query: updateCurrentUser', () => {
    let user: User

    const mutation = `
      mutation UpdateCurrentUser($input: UpdateUserInput!) {
        updateCurrentUser(input: $input) {
          user {
            id
            username
            isActive
          }
        }
      }
    `

    const userInput = {isActive: true}

    beforeAll(async () => {
      user = await createUser(userInput)
    })

    afterAll(async () => {
      try {
        await deleteUser(user.id)
      } catch (_err) {
        // pass
      }
    })

    it('updates the currently authenticated user', async () => {
      const {token, username} = credentials
      const variables = {
        input: {isActive: false},
      }

      const expected = {
        id: user.id,
        username,
        isActive: false,
      }

      const {data} = await graphql.mutation<
        Pick<Mutation, 'updateCurrentUser'>
      >(mutation, variables, {token})

      expect(data.updateCurrentUser).toHaveProperty(
        'user',
        expect.objectContaining(expected)
      )

      const updated = await prisma.user.findFirst({
        where: {id: data.updateCurrentUser.user?.id},
      })
      expect(updated).toMatchObject(expected)

      // Restore the user for other tests
      user = await createUser(userInput)
    })

    it('requires authentication', async () => {
      const variables = {
        input: {isActive: false},
      }

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

    it('requires a valid user record', async () => {
      const {token} = credentials
      const variables = {
        input: {isActive: false},
      }

      // Delete the user so that no user is found
      await deleteUser(user.id)

      const body = await graphql.mutation<Pick<Mutation, 'updateCurrentUser'>>(
        mutation,
        variables,
        {token, warn: false}
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

      // Restore the user for other tests
      user = await createUser(userInput)
    })
  })
})

import {Prisma, Profile, User} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {omit, pick} from 'lodash'

import {PrismaService} from '@caster/utils'
import {OAuth2, GraphQL, Validation, dbCleaner} from '@caster/utils/test'
import {Schema} from '@caster/graphql'
import {CreateProfileInput} from '@caster/users'
import {ProfileFactory} from '@caster/users/test'
import {Query, Mutation} from '@caster/graphql/schema'

import {AppModule} from '../src/app.module'

describe('Profiles', () => {
  let app: INestApplication
  let graphql: GraphQL

  let user: User
  let otherUser: User

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = PrismaService.init()

  const tables = ['User', 'Profile']

  const createProfile = (input: CreateProfileInput) =>
    prisma.profile.upsert({
      include: {user: true},
      where: {userId: input.userId},
      create: input,
      update: input,
    })

  const deleteProfile = (id: string) => prisma.profile.delete({where: {id}})

  const mockCensor = (profile?: Partial<Profile>) => ({
    ...profile,
    email: null,
    userId: null,
  })

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
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    otherUser = await prisma.user.create({data: {username, isActive: true}})
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  describe('Mutation: createProfile', () => {
    const mutation = `
      mutation CreateProfile($input: CreateProfileInput!) {
        createProfile(input: $input) {
          profile {
            id
            email
            displayName
            picture
            user {
              id
            }
          }
        }
      }
    `

    it('creates a new user profile', async () => {
      const {token} = credentials
      const profile = omit(ProfileFactory.makeCreateInput({userId: user.id}), [
        'user',
      ])
      const variables = {input: profile}

      const expected = {
        ...profile,
        id: expect.stringMatching(Validation.uuidRegex),
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'createProfile'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.createProfile).toHaveProperty(
        'profile',
        expect.objectContaining({
          ...omit(expected, 'userId'),
          user: {id: user.id},
        })
      )

      const created = await prisma.profile.findFirst({
        where: {id: data.createProfile.profile?.id},
      })

      if (!created) {
        fail('No profile created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.createProfile.profile?.id,
      })

      await prisma.profile.delete({
        where: {id: created.id},
      })
    })

    it('requires an email address and a userId', async () => {
      const {token} = credentials
      const profile = omit(ProfileFactory.makeCreateInput(), [
        'userId',
        'email',
      ])
      const variables = {input: profile}

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
              'Field "email" of required type "String!" was not provided.'
            ),
          }),
          expect.objectContaining({
            message: expect.stringContaining(
              'Field "userId" of required type "String!" was not provided.'
            ),
          }),
        ])
      )
    })

    it('requires authentication', async () => {
      const profile = ProfileFactory.makeCreateInput({userId: user.id})
      const variables = {input: profile}

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
      const profile = omit(
        ProfileFactory.makeCreateInput({userId: otherUser.id}),
        ['user']
      )
      const variables = {input: profile}

      const body = await graphql.mutation(mutation, variables, {
        token,
        warn: false,
      })

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Authorization required',
          extensions: {
            code: 'FORBIDDEN',
            response: {
              error: 'Forbidden',
              message: 'Authorization required',
              statusCode: 403,
            },
          },
        }),
      ])
    })
  })

  describe('Query: getProfile', () => {
    let profile: Profile
    let profileInput: CreateProfileInput

    const query = `
      query GetProfile($id: ID!) {
        getProfile(id: $id) {
          id
          email
          displayName
          picture
          user {
            id
          }
        }
      }
    `
    const fields = ['id', 'email', 'displayName', 'picture', 'user.id']

    beforeAll(async () => {
      profileInput = ProfileFactory.makeCreateInput({userId: user.id})

      profile = await createProfile(profileInput)
    })

    afterAll(async () => {
      try {
        await deleteProfile(profile.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves an existing user profile', async () => {
      const {token} = credentials
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toEqual(expected)
    })

    it('returns nothing when no profile is found', async () => {
      const {token} = credentials
      const variables = {id: profile.id}

      await deleteProfile(profile.id)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toBeFalsy()

      // Restore the profile for other tests
      profile = await createProfile(profileInput)
    })

    it('censors responses for anonymous users', async () => {
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {}
      )

      expect(data.getProfile).toEqual(mockCensor(expected))
    })

    it('censors responses for unauthorized users', async () => {
      const {token} = altCredentials
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toEqual(mockCensor(expected))
    })
  })
})
